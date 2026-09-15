export default (sequelize, Sequelize) => {
  const User = sequelize.define('users', {
    id:{
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance:{
      type: Sequelize.BIGINT,
      defaultValue: 0
    },
    refereral:{
      type: Sequelize.INTEGER
    },
    plan_expire:{
      type: Sequelize.DATE, // <-- Bu yerda to'g'ri yozilgan
      allowNull: true
    }
  },
  {timestamps: true}
)
return User
}