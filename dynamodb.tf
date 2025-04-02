module "dynamodb_table" {
  source   = "terraform-aws-modules/dynamodb-table/aws"

  name     = "Todos"
  hash_key = "id"

  attributes = [
    {
      name = "id"
      type = "S"
    }
  ]

  tags = {
    Environment = var.landscape
  }
}