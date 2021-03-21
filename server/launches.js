module.exports = function(sequelize, DataTypes) {
  return sequelize.define('launches', {
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false
    },
    spec: {
      type: DataTypes.STRING,
      allowNull: false
    },
    repo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ref: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resolved_ref: {
      type: DataTypes.STRING,
      allowNull: false
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    schema: {
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'launches',
    timestamps: false
  });
};
