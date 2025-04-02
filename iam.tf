resource "aws_lambda_permission" "allow_execution" {
  statement_id   = "FunctionURLAllowPublicAccess"
  action         = "lambda:InvokeFunctionUrl"
  function_name  = aws_lambda_function.api_lambda.arn
  principal      = "*"
  function_url_auth_type = "NONE"
}

resource "aws_iam_policy" "policy_dynamodb_todos" {
  name        = "dynamodb-todos-${var.landscape}"
  path        = "/"
  description = "Policy for table Todos in ${var.landscape}"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ReadWriteTable",
            "Effect": "Allow",
            "Action": [
                "dynamodb:BatchGetItem",
                "dynamodb:GetItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:BatchWriteItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/Todos"
        },
        {
            "Sid": "GetStreamRecords",
            "Effect": "Allow",
            "Action": "dynamodb:GetRecords",
            "Resource": "arn:aws:dynamodb:*:*:table/Todos/stream/* "
        },
        {
            "Sid": "WriteLogStreamsAndGroups",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        },
        {
            "Sid": "CreateLogGroup",
            "Effect": "Allow",
            "Action": "logs:CreateLogGroup",
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_policy" "policy_cognito" {
  name        = "cognito-${var.landscape}"
  path        = "/"
  description = "Policy for Cognito in ${var.landscape}"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Cognito",
            "Effect": "Allow",
            "Action": [
                "cognito-idp:ListUsers",
                "cognito-idp:SignUp"
            ],
            "Resource": "${aws_cognito_user_pool.app.arn}"
        }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "api_lambda_function_policy_dynamodb" {
  role       = aws_iam_role.api_lambda_function_role.name
  policy_arn = aws_iam_policy.policy_dynamodb_todos.arn
}

resource "aws_iam_role_policy_attachment" "api_lambda_function_policy_cognito" {
  role       = aws_iam_role.api_lambda_function_role.name
  policy_arn = aws_iam_policy.policy_cognito.arn
}