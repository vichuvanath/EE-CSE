from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = "development"
    DATABASE_URL: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = "secret-jwt-key-for-dev-min-32-chars-long"

    def model_post_init(self, __context):
        if self.ENVIRONMENT.lower() == "production":
            if not self.SUPABASE_JWT_SECRET or self.SUPABASE_JWT_SECRET == "secret-jwt-key-for-dev-min-32-chars-long":
                raise ValueError(
                    "CRITICAL CONFIGURATION ERROR: SUPABASE_JWT_SECRET must be explicitly configured in environment variables for production!"
                )


settings = Settings()
