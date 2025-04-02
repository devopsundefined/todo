resource "aws_cognito_user_pool" "app" {
  name = "app-pool"

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}


resource "aws_cognito_user_pool_client" "client" {
  name = "client"

  user_pool_id = aws_cognito_user_pool.app.id
  explicit_auth_flows = [ "USER_PASSWORD_AUTH" ]
}