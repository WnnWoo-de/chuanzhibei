-- ============================================================
-- GreenSight AI Web (绿芽) 项目数据库初始化 SQL
-- 数据库方言: MySQL 8.0+
-- 生成时间: 2026-03-25
-- 模块: 用户、社区、聊天、重构、垃圾识别、碳足迹、成就、志愿者
-- 使用: node scripts/init_db.js
--    或: mysql -u root -p < scripts/init_database.sql
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `greenn_web`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `greenn_web`;

-- ============================================================
-- 1. 用户表 (Users)
--    对应模型: models/User.js
--    支持本地账号 + Google/Microsoft OAuth 双模式登录
-- ============================================================
CREATE TABLE IF NOT EXISTS `Users` (
    `id`                        CHAR(36)      NOT NULL COMMENT '用户唯一ID (UUID v4)',
    `email`                     VARCHAR(255)  NOT NULL COMMENT '邮箱（唯一，用于登录）',
    `password`                  VARCHAR(255)  NULL     COMMENT 'bcrypt 加密密码（OAuth用户为空）',
    `username`                  VARCHAR(255)  NOT NULL COMMENT '用户名/昵称（应用层限制 2-20 字符）',
    `points`                    INT           NOT NULL DEFAULT 0 COMMENT '绿色积分（默认0）',
    `googleId`                  VARCHAR(255)  NULL     COMMENT 'Google OAuth 唯一标识',
    `microsoftId`               VARCHAR(255)  NULL     COMMENT 'Microsoft OAuth 唯一标识',
    `avatar`                    VARCHAR(1000) NULL     COMMENT '头像 URL',
    `bio`                       VARCHAR(500)  NULL     COMMENT '个人简介',
    `emailVerified`             TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '邮箱验证：0=未验证，1=已验证',
    `emailVerificationToken`    VARCHAR(255)  NULL     COMMENT '邮箱验证令牌',
    `emailVerificationExpires`  DATETIME      NULL     COMMENT '邮箱验证令牌过期时间',
    `passwordResetToken`        VARCHAR(255)  NULL     COMMENT '密码重置令牌',
    `passwordResetExpires`      DATETIME      NULL     COMMENT '密码重置令牌过期时间',
    `lastLoginAt`               DATETIME      NULL     COMMENT '最后登录时间',
    `lastLoginIp`               VARCHAR(50)   NULL     COMMENT '最后登录 IP',
    `createdAt`                 DATETIME      NOT NULL COMMENT '账号创建时间',
    `updatedAt`                 DATETIME      NOT NULL COMMENT '账号更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uq_users_email`       (`email`),
    UNIQUE INDEX `uq_users_googleId`    (`googleId`),
    UNIQUE INDEX `uq_users_microsoftId` (`microsoftId`),
    UNIQUE INDEX `uq_users_username`    (`username`),
    INDEX `idx_users_emailVerified`     (`emailVerified`),
    INDEX `idx_users_points`            (`points` DESC),
    INDEX `idx_users_lastLoginAt`       (`lastLoginAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户账号表（本地登录 + OAuth）';


-- ============================================================
-- 2. 社区帖子表 (Posts)
--    对应模型: models/Post.js
--    控制器: controllers/communityController.js
-- ============================================================
CREATE TABLE IF NOT EXISTS `Posts` (
    `id`          CHAR(36)  NOT NULL COMMENT '帖子唯一ID (UUID v4)',
    `content`     TEXT      NOT NULL COMMENT '帖子正文',
    `images`      JSON      NOT NULL COMMENT '图片URL数组，默认[]',
    `likes_count` INT       NOT NULL DEFAULT 0 COMMENT '点赞总数（冗余计数）',
    `views_count` INT       NOT NULL DEFAULT 0 COMMENT '浏览次数',
    `userId`      CHAR(36)  NULL     COMMENT '发帖用户ID（用户删除后置NULL）',
    `createdAt`   DATETIME  NOT NULL COMMENT '发布时间',
    `updatedAt`   DATETIME  NOT NULL COMMENT '最后修改时间',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_posts_userId`
        FOREIGN KEY (`userId`) REFERENCES `Users`(`id`)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX `idx_posts_userId`      (`userId`),
    INDEX `idx_posts_createdAt`   (`createdAt` DESC),
    INDEX `idx_posts_likes_count` (`likes_count` DESC),
    INDEX `idx_posts_views_count` (`views_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='社区帖子表（图文 + 点赞/浏览统计）';


-- ============================================================
-- 3. 帖子点赞记录表 (PostLikes)
--    实现用户维度去重点赞，配合 Posts.likes_count 冗余字段
-- ============================================================
CREATE TABLE IF NOT EXISTS `PostLikes` (
    `id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `postId`    CHAR(36)        NOT NULL COMMENT '帖子ID',
    `userId`    CHAR(36)        NOT NULL COMMENT '用户ID',
    `createdAt` DATETIME        NOT NULL COMMENT '点赞时间',
    `updatedAt` DATETIME        NOT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uq_postlikes_post_user` (`postId`, `userId`),
    CONSTRAINT `fk_postlikes_postId`
        FOREIGN KEY (`postId`) REFERENCES `Posts`(`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_postlikes_userId`
        FOREIGN KEY (`userId`) REFERENCES `Users`(`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX `idx_postlikes_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='帖子点赞记录表（用户维度去重）';


-- ============================================================
-- 4. AI 聊天历史表 (ChatHistories)
--    对应模型: models/ChatHistory.js
--    控制器: controllers/chatController.js
--    游客消息不写入此表
-- ============================================================
CREATE TABLE IF NOT EXISTS `ChatHistories` (
    `id`        CHAR(36)                 NOT NULL COMMENT '消息唯一ID (UUID v4)',
    `role`      ENUM('user','assistant') NOT NULL COMMENT 'user=用户输入，assistant=AI回复',
    `content`   MEDIUMTEXT               NOT NULL COMMENT '消息内容（最大16MB）',
    `userId`    CHAR(36)                 NULL     COMMENT '用户ID（用户删除时级联删除）',
    `createdAt` DATETIME                 NOT NULL COMMENT '消息创建时间',
    `updatedAt` DATETIME                 NOT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_chathistories_userId`
        FOREIGN KEY (`userId`) REFERENCES `Users`(`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX `idx_chat_userId_createdAt` (`userId`, `createdAt` ASC),
    INDEX `idx_chat_role`             (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='AI聊天历史记录表（GLM/SiliconFlow，用户删除级联清除）';


-- ============================================================
-- 5. ReconstructionRecords
--    controller: reconstructionController.js
--    frontend:   views/reconstruction/ReconstructionView.vue
-- ============================================================
CREATE TABLE IF NOT EXISTS `ReconstructionRecords` (
    `id`               CHAR(36)      NOT NULL COMMENT 'UUID v4',
    `userId`           CHAR(36)      NULL COMMENT '关联用户ID，游客分析可为空',
    `imageUrl`         VARCHAR(1000) NOT NULL COMMENT '上传图片访问地址',
    `originalFilename` VARCHAR(255)  NULL COMMENT '原始文件名',
    `material`         VARCHAR(255)  NULL COMMENT '识别材质结果',
    `integrity`        VARCHAR(100)  NULL COMMENT '结构完整度评估',
    `carbonReduction`  VARCHAR(50)   NULL COMMENT '预估碳减排文本，如 12.5 kg CO₂e',
    `suggestions`      JSON          NULL COMMENT 'AI 返回的重构建议数组',
    `analysisId`       VARCHAR(100)  NULL COMMENT '业务分析ID，如 rec_时间戳',
    `pointsEarned`     INT           NOT NULL DEFAULT 0 COMMENT '本次分析奖励积分',
    `isPublished`      TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '是否发布到案例社区',
    `createdAt`        DATETIME      NOT NULL,
    `updatedAt`        DATETIME      NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uq_reconstruction_analysisId` (`analysisId`),
    CONSTRAINT `fk_reconstruction_userId`
        FOREIGN KEY (`userId`) REFERENCES `Users`(`id`)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX `idx_reconstruction_userId`    (`userId`),
    INDEX `idx_reconstruction_createdAt` (`createdAt` DESC),
    INDEX `idx_reconstruction_material`  (`material`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='旧物重构AI分析记录表';

-- ============================================================
-- 6. WasteRecognitionRecords
--    frontend: views/chat/WasteRecognitionView.vue
-- ============================================================
CREATE TABLE IF NOT EXISTS `WasteRecognitionRecords` (
    `id`               CHAR(36)      NOT NULL COMMENT 'UUID v4',
    `userId`           CHAR(36)      NULL COMMENT '关联用户ID，游客识别可为空',
    `imageUrl`         VARCHAR(1000) NOT NULL COMMENT '上传图片访问地址',
    `originalFilename` VARCHAR(255)  NULL COMMENT '原始文件名',
    `wasteCategory`    VARCHAR(50)   NULL COMMENT '识别出的垃圾分类',
    `wasteName`        VARCHAR(100)  NULL COMMENT '识别出的物品名称',
    `confidence`       DECIMAL(5,2)  NULL COMMENT '识别置信度百分比',
    `aiExplanation`    TEXT          NULL COMMENT 'AI 对分类结果的说明',
    `tips`             JSON          NULL COMMENT '环保建议或投放提示列表',
    `pointsEarned`     INT           NOT NULL DEFAULT 0 COMMENT '本次识别奖励积分',
    `createdAt`        DATETIME      NOT NULL,
    `updatedAt`        DATETIME      NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_wasterec_userId`
        FOREIGN KEY (`userId`) REFERENCES `Users`(`id`)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX `idx_wasterec_userId`        (`userId`),
    INDEX `idx_wasterec_createdAt`     (`createdAt` DESC),
    INDEX `idx_wasterec_wasteCategory` (`wasteCategory`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='垃圾识别记录表';


-- ============================================================
-- 7. CarbonFootprintRecords
--    frontend: views/chat/CarbonFootprintView.vue
-- ============================================================
CREATE TABLE IF NOT EXISTS `CarbonFootprintRecords` (
    `id`                CHAR(36)     NOT NULL COMMENT 'UUID v4',
    `userId`            CHAR(36)     NULL COMMENT '关联用户ID，游客测算可为空',
    `commuteKm`         DECIMAL(8,1) NOT NULL DEFAULT 0 COMMENT '通勤距离（km）',
    `commuteMode`       ENUM('bike','bus','car') NOT NULL DEFAULT 'bus' COMMENT '通勤方式',
    `electricityKwh`    DECIMAL(8,1) NOT NULL DEFAULT 0 COMMENT '家庭用电（kWh）',
    `meatMeals`         INT          NOT NULL DEFAULT 0 COMMENT '肉类餐食次数',
    `transportEmission` DECIMAL(8,2) NOT NULL DEFAULT 0 COMMENT '交通排放（kg CO₂e）',
    `energyEmission`    DECIMAL(8,2) NOT NULL DEFAULT 0 COMMENT '用电排放（kg CO₂e）',
    `lifestyleEmission` DECIMAL(8,2) NOT NULL DEFAULT 0 COMMENT '饮食排放（kg CO₂e）',
    `totalEmission`     DECIMAL(8,2) NOT NULL DEFAULT 0 COMMENT '总排放（kg CO₂e）',
    `rating`            ENUM('low','medium','high') NOT NULL DEFAULT 'medium' COMMENT '排放等级',
    `aiAdvice`          TEXT         NULL COMMENT 'AI 绿色出行建议',
    `createdAt`         DATETIME     NOT NULL,
    `updatedAt`         DATETIME     NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_carbon_userId`
        FOREIGN KEY (`userId`) REFERENCES `Users`(`id`)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX `idx_carbon_userId`        (`userId`),
    INDEX `idx_carbon_createdAt`     (`createdAt` DESC),
    INDEX `idx_carbon_totalEmission` (`totalEmission`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='碳足迹分析记录表';


-- ============================================================
-- 8. Achievements
--    frontend: views/achievements/AchievementsView.vue
-- ============================================================
CREATE TABLE IF NOT EXISTS `Achievements` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code`          VARCHAR(50)  NOT NULL COMMENT '成就唯一编码',
    `name`          VARCHAR(100) NOT NULL COMMENT '成就名称',
    `description`   VARCHAR(500) NOT NULL COMMENT '成就描述',
    `icon`          VARCHAR(255) NULL COMMENT '图标名称或图标字符',
    `category`      VARCHAR(50)  NOT NULL DEFAULT 'general' COMMENT '成就分类',
    `requirement`   VARCHAR(500) NULL COMMENT '前端展示的获取条件说明',
    `conditionJson` JSON         NOT NULL COMMENT '程序判定条件 JSON',
    `pointsReward`  INT          NOT NULL DEFAULT 0 COMMENT '奖励积分',
    `rarity`        ENUM('common','rare','epic','legendary') NOT NULL DEFAULT 'common' COMMENT '稀有度',
    `sortOrder`     INT          NOT NULL DEFAULT 0 COMMENT '展示排序',
    `createdAt`     DATETIME     NOT NULL,
    `updatedAt`     DATETIME     NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uq_achievements_code` (`code`),
    INDEX `idx_achievements_category`   (`category`),
    INDEX `idx_achievements_rarity`     (`rarity`),
    INDEX `idx_achievements_sortOrder`  (`sortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='成就/徽章定义表';

SET @ach_requirement_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Achievements'
      AND COLUMN_NAME = 'requirement'
);
SET @ach_requirement_sql := IF(
    @ach_requirement_exists = 0,
    'ALTER TABLE `Achievements` ADD COLUMN `requirement` VARCHAR(500) NULL COMMENT ''前端展示的获取条件说明'' AFTER `category`',
    'SELECT 1'
);
PREPARE ach_requirement_stmt FROM @ach_requirement_sql;
EXECUTE ach_requirement_stmt;
DEALLOCATE PREPARE ach_requirement_stmt;


-- ============================================================
-- 9. UserAchievements
-- ============================================================
CREATE TABLE IF NOT EXISTS `UserAchievements` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId`        CHAR(36)        NOT NULL,
    `achievementId` INT UNSIGNED    NOT NULL,
    `progress`      INT             NOT NULL DEFAULT 0 COMMENT '当前进度值',
    `target`        INT             NULL COMMENT '目标值快照',
    `unlockedAt`    DATETIME        NULL COMMENT '解锁时间，未解锁可为空',
    `createdAt`     DATETIME        NOT NULL,
    `updatedAt`     DATETIME        NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uq_userachv_user_achievement` (`userId`, `achievementId`),
    CONSTRAINT `fk_userachv_userId`
        FOREIGN KEY (`userId`) REFERENCES `Users`(`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_userachv_achievementId`
        FOREIGN KEY (`achievementId`) REFERENCES `Achievements`(`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX `idx_userachv_achievementId` (`achievementId`),
    INDEX `idx_userachv_unlockedAt`    (`unlockedAt` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户成就解锁记录表';


-- ============================================================
-- 10. VolunteerActivities
--     frontend: views/volunteer/VolunteerView.vue
-- ============================================================
CREATE TABLE IF NOT EXISTS `VolunteerActivities` (
    `id`              CHAR(36)      NOT NULL,
    `title`           VARCHAR(200)  NOT NULL COMMENT '活动标题',
    `description`     TEXT          NULL COMMENT '活动描述',
    `category`        VARCHAR(50)   NOT NULL DEFAULT '社区清洁' COMMENT '活动分类',
    `location`        VARCHAR(255)  NULL COMMENT '活动地点',
    `startTime`       DATETIME      NOT NULL COMMENT '开始时间',
    `endTime`         DATETIME      NULL COMMENT '结束时间',
    `durationHours`   DECIMAL(4,1)  NOT NULL DEFAULT 0 COMMENT '活动计划时长（小时）',
    `maxParticipants` INT           NULL COMMENT '最大参与人数',
    `currentCount`    INT           NOT NULL DEFAULT 0 COMMENT '当前报名人数',
    `pointsReward`    INT           NOT NULL DEFAULT 0 COMMENT '默认奖励积分',
    `pointsPerHour`   INT           NOT NULL DEFAULT 0 COMMENT '每小时奖励积分',
    `status`          ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending' COMMENT '活动状态',
    `isUrgent`        TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '是否急需志愿者',
    `notes`           VARCHAR(500)  NULL COMMENT '活动须知',
    `coverImage`      VARCHAR(1000) NULL COMMENT '封面图地址',
    `organizerId`     CHAR(36)      NULL COMMENT '组织者用户ID',
    `createdAt`       DATETIME      NOT NULL,
    `updatedAt`       DATETIME      NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_volunteer_organizerId`
        FOREIGN KEY (`organizerId`) REFERENCES `Users`(`id`)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX `idx_volunteer_status`    (`status`),
    INDEX `idx_volunteer_startTime` (`startTime` DESC),
    INDEX `idx_volunteer_category`  (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='志愿者活动表';


-- ============================================================
-- 11. VolunteerEnrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS `VolunteerEnrollments` (
    `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId`          CHAR(36)        NOT NULL,
    `activityId`      CHAR(36)        NOT NULL,
    `status`          ENUM('registered','confirmed','completed','cancelled') NOT NULL DEFAULT 'registered',
    `phone`           VARCHAR(50)     NULL COMMENT '报名联系电话',
    `remark`          VARCHAR(500)    NULL COMMENT '报名备注',
    `agreedRules`     TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '是否同意活动规则',
    `loggedHours`     DECIMAL(4,1)    NOT NULL DEFAULT 0 COMMENT '记录的志愿时长',
    `reflection`      VARCHAR(500)    NULL COMMENT '活动感想',
    `pointsAwarded`   INT             NOT NULL DEFAULT 0 COMMENT '实际发放积分',
    `enrolledAt`      DATETIME        NOT NULL,
    `completedAt`     DATETIME        NULL,
    `createdAt`       DATETIME        NOT NULL,
    `updatedAt`       DATETIME        NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uq_enrollment_user_activity` (`userId`, `activityId`),
    CONSTRAINT `fk_enrollment_userId`
        FOREIGN KEY (`userId`) REFERENCES `Users`(`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_enrollment_activityId`
        FOREIGN KEY (`activityId`) REFERENCES `VolunteerActivities`(`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX `idx_enrollment_activityId` (`activityId`),
    INDEX `idx_enrollment_status`     (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='志愿者报名记录表';


-- ============================================================
-- 12. 种子数据：平台初始成就
-- ============================================================
INSERT IGNORE INTO `Achievements`
    (`code`,`name`,`description`,`icon`,`category`,`requirement`,`conditionJson`,`pointsReward`,`rarity`,`sortOrder`,`createdAt`,`updatedAt`)
VALUES
    ('ECO_BEGINNER',   '环保新手',    '完成第一次垃圾识别',       'Sunrise',    'recycling', '完成 1 次垃圾识别',          '{"type":"waste_count","value":1}',        10,  'common',    1, NOW(),NOW()),
    ('ECO_IDENTIFIER', '分类达人',    '累计完成10次垃圾识别',     'Compass',    'recycling', '累计完成 10 次垃圾识别',     '{"type":"waste_count","value":10}',       30,  'rare',      2, NOW(),NOW()),
    ('ECO_RECYCLER',   '旧物重构师',  '完成第一次旧物重构分析',   'Refresh',    'recycling', '完成 1 次旧物重构分析',      '{"type":"recon_count","value":1}',        10,  'common',    3, NOW(),NOW()),
    ('ECO_CREATOR',    '创意改造家',  '累计完成5次旧物重构',      'MagicStick', 'recycling', '累计完成 5 次旧物重构分析',   '{"type":"recon_count","value":5}',        50,  'rare',      4, NOW(),NOW()),
    ('CARBON_TRACKER', '碳足迹记录者','首次完成碳足迹分析',       'Sunny',      'carbon',    '完成 1 次碳足迹分析',        '{"type":"carbon_count","value":1}',       10,  'common',    5, NOW(),NOW()),
    ('CARBON_HERO',    '低碳英雄',    '月碳排放达到低碳评级',     'Planet',     'carbon',    '碳足迹评级达到 low',         '{"type":"carbon_rating","value":"low"}', 50,  'epic',      6, NOW(),NOW()),
    ('COMMUNITY_STAR', '社区之星',    '发布第一篇社区帖子',       'Star',       'community', '发布 1 篇社区帖子',          '{"type":"post_count","value":1}',         10,  'common',    7, NOW(),NOW()),
    ('POPULAR_POSTER', '人气博主',    '累计获得50个点赞',         'Promotion',  'community', '累计获得 50 个点赞',         '{"type":"likes_received","value":50}',    30,  'rare',      8, NOW(),NOW()),
    ('VOLUNTEER_HEART','志愿之心',    '首次参与志愿活动',         'Medal',      'volunteer', '首次报名并参与志愿活动',      '{"type":"volunteer_count","value":1}',    20,  'common',    9, NOW(),NOW()),
    ('ECO_WARRIOR',    '环保勇士',    '积分达到500分',            'Trophy',     'general',   '积分达到 500 分',            '{"type":"points","value":500}',           100, 'epic',      10,NOW(),NOW()),
    ('GREEN_LEGEND',   '绿色传奇',    '积分达到2000分',           'TrophyBase', 'general',   '积分达到 2000 分',           '{"type":"points","value":2000}',          500, 'legendary', 11,NOW(),NOW());


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 表结构总览
-- Users / Posts / PostLikes / ChatHistories
-- ReconstructionRecords / WasteRecognitionRecords / CarbonFootprintRecords
-- Achievements / UserAchievements
-- VolunteerActivities / VolunteerEnrollments
-- ============================================================
