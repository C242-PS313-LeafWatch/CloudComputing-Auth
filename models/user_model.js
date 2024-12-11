import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Users = db.define('users', {
    name: { 
      type: DataTypes.STRING,
      allowNull: false,  
    },
    email: { 
      type: DataTypes.STRING,
      allowNull: false,  
      unique: true,      
      validate: {
        isEmail: true,  
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,  
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,  
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,  
    },
    birth_date: { 
      type: DataTypes.DATE,
      allowNull: false,  
    }
  }, {
    freezeTableName: true,
  });
  
  export default Users;
  