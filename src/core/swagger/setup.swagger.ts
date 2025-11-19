import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blogger Platform API",
      version: "1.0.0",
      description: "blogger_platform API",
    },
  },
  apis: ["./src/**/*.swagger.yml"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

// ? swagger - как бы наша фронтенд документация - http://localhost:5001/api/
