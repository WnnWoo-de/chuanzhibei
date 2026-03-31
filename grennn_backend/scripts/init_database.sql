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
    `username`                  VARCHAR(100)  NOT NULL COMMENT '用户名/昵称（2-20字符）',
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
    INDEX `idx_users_username`          (`username`),
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
    `userId`           CHAR(36)      NULL,
    `imageUrl`         VARCHAR(1000) NOT NULL,
    `originalFilename` VARCHAR(255)  NULL,
    `material`         VARCHAR(100)  NULL,
    `integrity`        VARCHAR(50)   NULL,
    `carbonReduction`  DECIMAL(8,2)  NULL,
    `suggestions`      JSON          NULL,
    `analysisId`       VARCHAR(50)   NULL,
    `pointsEarned`     INT           NOT NULL DEFAULT 0,
    `isPublished`      TINYINT(1)    NOT NULL DEFAULT 0,
    `createdAt`        DATETIME      NOT NULL,
    `updatedAt`        DATETIME      NOT NULL,
    PRIMARY KEY (`id`),
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
    `userId`           CHAR(36)      NULL,
    `imageUrl`         VARCHAR(1000) NOT NULL,
    `originalFilename` VARCHAR(255)  NULL,
    `wasteCategory`    VARCHAR(50)   NULL,
    `wasteName`        VARCHAR(100)  NULL,
    `confidence`       DECIMAL(5,2)  NULL,
    `aiExplanation`    TEXT          NULL,
    `pointsEarned`     INT           NOT NULL DEFAULT 0,
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
    `userId`            CHAR(36)     NULL,
    `carKm`             DECIMAL(8,1) NOT NULL DEFAULT 0,
    `publicTransportKm` DECIMAL(8,1) NOT NULL DEFAULT 0,
    `electricityKwh`    DECIMAL(8,1) NOT NULL DEFAULT 0,
    `gasM3`             DECIMAL(8,1) NOT NULL DEFAULT 0,
    `meatFrequency`     ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    `transportEmission` DECIMAL(8,2) NOT NULL DEFAULT 0,
    `energyEmission`    DECIMAL(8,2) NOT NULL DEFAULT 0,
    `lifestyleEmission` DECIMAL(8,2) NOT NULL DEFAULT 0,
    `totalEmission`     DECIMAL(8,2) NOT NULL DEFAULT 0,
    `rating`            ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    `aiAdvice`          TEXT         NULL,
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
    `code`          VARCHAR(50)  NOT NULL,
    `name`          VARCHAR(100) NOT NULL,
    `description`   VARCHAR(500) NOT NULL,
    `icon`          VARCHAR(255) NULL,
    `category`      VARCHAR(50)  NOT NULL DEFAULT 'general',
    `conditionJson` JSON         NOT NULL,
    `pointsReward`  INT          NOT NULL DEFAULT 0,
    `rarity`        ENUM('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
    `sortOrder`     INT          NOT NULL DEFAULT 0,
    `createdAt`     DATETIME     NOT NULL,
    `updatedAt`     DATETIME     NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uq_achievements_code` (`code`),
    INDEX `idx_achievements_category`   (`category`),
    INDEX `idx_achievements_rarity`     (`rarity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='成就/徽章定义表';


-- ============================================================
-- 9. UserAchievements
-- ============================================================
CREATE TABLE IF NOT EXISTS `UserAchievements` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId`        CHAR(36)        NOT NULL,
    `achievementId` INT UNSIGNED    NOT NULL,
    `unlockedAt`    DATETIME        NOT NULL,
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
    `title`           VARCHAR(200)  NOT NULL,
    `description`     TEXT          NULL,
    `category`        VARCHAR(50)   NOT NULL DEFAULT 'cleanup',
    `location`        VARCHAR(255)  NULL,
    `startTime`       DATETIME      NOT NULL,
    `endTime`         DATETIME      NULL,
    `maxParticipants` INT           NULL,
    `currentCount`    INT           NOT NULL DEFAULT 0,
    `pointsReward`    INT           NOT NULL DEFAULT 0,
    `status`          ENUM('upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
    `coverImage`      VARCHAR(1000) NULL,
    `organizerId`     CHAR(36)      NULL,
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
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId`        CHAR(36)        NOT NULL,
    `activityId`    CHAR(36)        NOT NULL,
    `status`        ENUM('enrolled','attended','cancelled') NOT NULL DEFAULT 'enrolled',
    `remark`        VARCHAR(500)    NULL,
    `pointsAwarded` INT             NOT NULL DEFAULT 0,
    `enrolledAt`    DATETIME        NOT NULL,
    `createdAt`     DATETIME        NOT NULL,
    `updatedAt`     DATETIME        NOT NULL,
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
    (`code`,`name`,`description`,`icon`,`category`,`conditionJson`,`pointsReward`,`rarity`,`sortOrder`,`createdAt`,`updatedAt`)
VALUES
    ('ECO_BEGINNER',   '环保新手',    '完成第一次垃圾识别',       '🌱','recycling', '{"type":"waste_count","value":1}',      10,  'common',    1, NOW(),NOW()),
    ('ECO_IDENTIFIER', '分类达人',    '累计完成10次垃圾识别',     '♻️','recycling','{"type":"waste_count","value":10}',     30,  'rare',      2, NOW(),NOW()),
    ('ECO_RECYCLER',   '旧物重构师',  '完成第一次旧物重构分析',   '🔨','recycling', '{"type":"recon_count","value":1}',      10,  'common',    3, NOW(),NOW()),
    ('ECO_CREATOR',    '创意改造家',  '累计完成5次旧物重构',      '🎨','recycling', '{"type":"recon_count","value":5}',      50,  'rare',      4, NOW(),NOW()),
    ('CARBON_TRACKER', '碳足迹记录者','首次完成碳足迹分析',       '📊','carbon',    '{"type":"carbon_count","value":1}',     10,  'common',    5, NOW(),NOW()),
    ('CARBON_HERO',    '低碳英雄',    '月碳排放达到低碳评级',     '🌍','carbon',    '{"type":"carbon_rating","value":"low"}', 50,  'epic',      6, NOW(),NOW()),
    ('COMMUNITY_STAR', '社区之星',    '发布第一篇社区帖子',       '⭐','community', '{"type":"post_count","value":1}',       10,  'common',    7, NOW(),NOW()),
    ('POPULAR_POSTER', '人气博主',    '累计获得50个点赞',         '👍','community', '{"type":"likes_received","value":50}',  30,  'rare',      8, NOW(),NOW()),
    ('VOLUNTEER_HEART','志愿之心',    '首次参与志愿活动',         '💚','volunteer', '{"type":"volunteer_count","value":1}',  20,  'common',    9, NOW(),NOW()),
    ('ECO_WARRIOR',    '环保勇士',    '积分达到500分',            '🏆','general',   '{"type":"points","value":500}',         100, 'epic',      10,NOW(),NOW()),
    ('GREEN_LEGEND',   '绿色传奇',    '积分达到2000分',           '👑','general',   '{"type":"points","value":2000}',        500, 'legendary', 11,NOW(),NOW());


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 表结构总览
-- Users / Posts / PostLikes / ChatHistories
-- ReconstructionRecords / WasteRecognitionRecords / CarbonFootprintRecords
-- Achievements / UserAchievements
-- VolunteerActivities / VolunteerEnrollments
-- ============================================================
