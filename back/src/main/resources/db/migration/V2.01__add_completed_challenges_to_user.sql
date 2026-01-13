CREATE TABLE IF NOT EXISTS user_completed_challenges (
  user_id bigint NOT NULL,
  challenge_id bigint NOT NULL,
  CONSTRAINT fk_user_completed_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_user_challenge ON user_completed_challenges (user_id, challenge_id);

