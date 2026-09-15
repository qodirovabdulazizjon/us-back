export default (sequelize, Sequelize) => {
  const Group = sequelize.define('groups', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    group_id: {
      type: Sequelize.STRING,
      allowNull: true
    },
    photo: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, { timestamps: true})
  return Group
}