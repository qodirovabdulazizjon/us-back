export default (sequelize, Sequelize) => {
  const Session = sequelize.define('sessions',{
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4, // Avtomatik UUID v4 (random string) generatori
      allowNull: false,
      primaryKey: true
    },
    ses: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    interval: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    imgUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },
    interval_id: {
      type: Sequelize.BIGINT,
      allowNull: true
    },
    number: {
      type: Sequelize.STRING,
      allowNull: true
    },
    thread_id:{
      type: Sequelize.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: true
  })
  return Session
}