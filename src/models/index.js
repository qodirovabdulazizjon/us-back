import dotenv from 'dotenv'
dotenv.config()

import { Sequelize } from 'sequelize'

const dbPassword = process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : ''

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  dbPassword,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  }
)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// Import models
import planModel from './plan.model.js'
import userModel from './user.model.js'
import sessionModel from './session.model.js'
import groupModel from './group.model.js'

// Modellarni db ga biriktirish
db.plan = planModel(sequelize, Sequelize)
db.user = userModel(sequelize, Sequelize)
db.session = sessionModel(sequelize, Sequelize)
db.group = groupModel(sequelize, Sequelize)

// ================= BOG'LIQLIKLAR (ASSOCIATIONS) =================

// 1. Plan <-> User (One-to-Many)
db.plan.hasMany(db.user, {
  foreignKey: 'plan_id',
  as: 'users',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
})

db.user.belongsTo(db.plan, {
  foreignKey: 'plan_id',
  as: 'plan'
})

// 2. User <-> Session (One-to-Many)
db.user.hasMany(db.session, {
  foreignKey: 'user_id',
  as: 'sessions',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
})

db.session.belongsTo(db.user, {
  foreignKey: 'user_id',
  as: 'user'
})

// 3. Session <-> Group (One-to-Many)
db.session.hasMany(db.group, {
  foreignKey: 'ses_id',
  as: 'groups',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
})

db.group.belongsTo(db.session, {
  foreignKey: 'ses_id',
  as: 'session'
})

export default db