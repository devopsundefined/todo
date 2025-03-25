data "archive_file" "api_lambda_function" {

  type = "zip"
  source_dir = "app/api"
  output_path = "lambda_function_api.zip"
}

data "aws_iam_policy_document" "AWSLambdaTrustPolicy" {
  statement {
    actions    = ["sts:AssumeRole"]
    effect     = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "api_lambda_function_role" {
  name               = "api_lambda_function_role"
  assume_role_policy = data.aws_iam_policy_document.AWSLambdaTrustPolicy.json
}

resource "aws_iam_role_policy_attachment" "api_lambda_function_policy" {
  role       = aws_iam_role.api_lambda_function_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}



resource "aws_lambda_function" "api_lambda" {
  function_name = "api-lambda"
  role = aws_iam_role.api_lambda_function_role.arn
  handler = "index.handler"
  filename = data.archive_file.api_lambda_function.output_path
  source_code_hash = data.archive_file.api_lambda_function.output_base64sha256
  runtime = "nodejs22.x"
  environment {
    variables = {
      USER_POOL_ID = aws_cognito_user_pool.app.id,
      CLIENT_ID = aws_cognito_user_pool_client.client.id
      REGION = var.region
    }
  }
}

resource "aws_lambda_function_url" "api_lambda" {
  function_name      = aws_lambda_function.api_lambda.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}