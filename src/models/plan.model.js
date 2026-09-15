export default (sequelize, Sequelize) => {
  const Plan = sequelize.define('plans', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4, // Avtomatik UUID v4 (random string) generatori
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    max_accounts: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    max_groups: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    allow_img: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  }, {
    timestamps: true
  });
  
  // Jadval sinxronizatsiya bo'lgach (stul/jadval yaratilgach) ishlaydi
  Plan.afterSync(async () => {
    const count = await Plan.count();
    // Agar plans jadvalida ma'lumot bo'lmasa, default Free Plan yaratiladi
    if (count === 0) {
      await Plan.create({
        name: 'Free',
        price: 0,
        max_accounts: 0,
        max_groups: 0,
        allow_img: false
      });
      console.log('Default Free plan muvaffaqiyatli yaratildi!')
    }
  })
  
  return Plan
}