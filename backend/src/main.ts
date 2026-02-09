import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Zet alle routes onder /api
  app.setGlobalPrefix("api");

  // Enable CORS with multiple origins
  const frontendUrls = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    process.env.PRODUCTION_FRONTEND_URL || "",
  ].filter(Boolean);

  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Serve uploaded files
  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads",
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Almere Pickleball API")
    .setDescription("Backend API for Almere Pickleball Trial System")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  const host = "0.0.0.0";
  await app.listen(port, host);
  console.log(`✓ Application is running on: http://${host}:${port}`);
  console.log(`✓ Swagger documentation: http://${host}:${port}/api/docs`);
}

bootstrap();
