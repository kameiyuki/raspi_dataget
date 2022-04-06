module.exports = {

  development: {
    client: "mysql",
    connection: {
      database: "python_db",
      user: "kamei",
      password: "Pl0h4h55@",
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  staging: {
    client: "mysql",
    connection: {
      database: "python_db",
      user: "kamei",
      password:  "Pl0h4h55@",
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  production: {
    client: "mysql",
    connection: {
      database: "python_db",
      user: "kamei",
      password: "Pl0h4h55@",
    },
    pool: {
      min: 2,
      max: 10
    },
  }

};