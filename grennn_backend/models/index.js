/**
 * models/index.js - 数据库模型聚合出口
 */

const sequelize               = require('../config/database');
const User                    = require('./User');
const Post                    = require('./Post');
const PostLike                = require('./PostLike');
const ChatHistory             = require('./ChatHistory');
const ReconstructionRecord    = require('./ReconstructionRecord');
const WasteRecognitionRecord  = require('./WasteRecognitionRecord');
const CarbonFootprintRecord   = require('./CarbonFootprintRecord');
const Achievement             = require('./Achievement');
const UserAchievement         = require('./UserAchievement');
const VolunteerActivity       = require('./VolunteerActivity');
const VolunteerEnrollment     = require('./VolunteerEnrollment');
const RewardProduct           = require('./RewardProduct');
const RedeemRecord            = require('./RedeemRecord');
const QuizQuestion            = require('./QuizQuestion');
const QuizRecord              = require('./QuizRecord');

Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });

PostLike.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
PostLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(PostLike, { foreignKey: 'postId', as: 'likes' });
User.hasMany(PostLike, { foreignKey: 'userId', as: 'postLikes' });

ChatHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ChatHistory, { foreignKey: 'userId', as: 'chatHistories' });

ReconstructionRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ReconstructionRecord, { foreignKey: 'userId', as: 'reconstructionRecords' });

WasteRecognitionRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(WasteRecognitionRecord, { foreignKey: 'userId', as: 'wasteRecognitionRecords' });

CarbonFootprintRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(CarbonFootprintRecord, { foreignKey: 'userId', as: 'carbonFootprintRecords' });

UserAchievement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievementId', as: 'achievement' });
User.hasMany(UserAchievement, { foreignKey: 'userId', as: 'userAchievements' });
Achievement.hasMany(UserAchievement, { foreignKey: 'achievementId', as: 'userAchievements' });

VolunteerActivity.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
User.hasMany(VolunteerActivity, { foreignKey: 'organizerId', as: 'organizedVolunteerActivities' });

VolunteerEnrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
VolunteerEnrollment.belongsTo(VolunteerActivity, { foreignKey: 'activityId', as: 'activity' });
User.hasMany(VolunteerEnrollment, { foreignKey: 'userId', as: 'volunteerEnrollments' });
VolunteerActivity.hasMany(VolunteerEnrollment, { foreignKey: 'activityId', as: 'enrollments' });

RedeemRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
RedeemRecord.belongsTo(RewardProduct, { foreignKey: 'productId', as: 'product' });
User.hasMany(RedeemRecord, { foreignKey: 'userId', as: 'redeemRecords' });
RewardProduct.hasMany(RedeemRecord, { foreignKey: 'productId', as: 'redeemRecords' });

QuizRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(QuizRecord, { foreignKey: 'userId', as: 'quizRecords' });

const db = {
    sequelize,
    User,
    Post,
    PostLike,
    ChatHistory,
    ReconstructionRecord,
    WasteRecognitionRecord,
    CarbonFootprintRecord,
    Achievement,
    UserAchievement,
    VolunteerActivity,
    VolunteerEnrollment,
    RewardProduct,
    RedeemRecord,
    QuizQuestion,
    QuizRecord,
};

module.exports = db;
