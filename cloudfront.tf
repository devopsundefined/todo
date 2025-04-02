resource "aws_cloudfront_origin_request_policy" "static_html_request_policy" {
  name    = "static-html-policy"
  comment = "Policy for requesting content from origin"
  cookies_config {
    cookie_behavior = "all"
  }
  headers_config {
    header_behavior = "allViewer"
  }
  query_strings_config {
    query_string_behavior = "all"
  }
  
}

resource "aws_cloudfront_response_headers_policy" "custom_headers_policy_html" {
  name = "custom-headers-policy-html"

  custom_headers_config {
    items {
      header   = "Content-Type"
      override = true
      value    = "text/html"
    }
  }
  security_headers_config {
    content_security_policy {
      content_security_policy = "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      override = true
    }
  }
}


resource "aws_cloudfront_response_headers_policy" "custom_headers_policy_js" {
  name = "custom-headers-policy-js"

  custom_headers_config {
    items {
      header   = "Content-Type"
      override = true
      value    = "text/javascript"
    }
  }
  security_headers_config {
    content_security_policy {
      content_security_policy = "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      override = true
    }
  }
}

resource "aws_cloudfront_response_headers_policy" "custom_headers_policy_css" {
  name = "custom-headers-policy-css"

  custom_headers_config {
    items {
      header   = "Content-Type"
      override = true
      value    = "text/css"
    }
  }
  security_headers_config {
    content_security_policy {
      content_security_policy = "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      override = true
    }
  }
}

resource "aws_cloudfront_distribution" "todo" {
  origin {
    domain_name              = var.html_cf_origin
    origin_path = var.html_cf_origin_uri
    origin_id                = "html_content"
      custom_origin_config {
        http_port = "80"
        https_port = "443"
        origin_protocol_policy = "https-only"
        origin_ssl_protocols = ["TLSv1.2"]
    }
  }

  origin {
    domain_name              = trim(trimprefix(aws_lambda_function_url.api_lambda.function_url,"https://"),"/")
    origin_id                = "api"
      custom_origin_config {
        http_port = "80"
        https_port = "443"
        origin_protocol_policy = "https-only"
        origin_ssl_protocols = ["TLSv1.2"]
      }
  }

  enabled             = true
  is_ipv6_enabled     = false
  comment             = "Web content"
  default_root_object = "index.html"

  #aliases = ["todo-app.devopsundefined.com"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "html_content"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.custom_headers_policy_html.id

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "*.js"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "html_content"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.custom_headers_policy_js.id

    min_ttl                = 0
    default_ttl            = 60
    max_ttl                = 3600
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

    ordered_cache_behavior {
    path_pattern     = "*.css"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "html_content"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.custom_headers_policy_css.id

    min_ttl                = 0
    default_ttl            = 60
    max_ttl                = 3600
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "/login"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "api"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "all"
      }

    }

    #response_headers_policy_id = aws_cloudfront_response_headers_policy.custom_headers_policy_html.id

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "/register"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "api"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "all"
      }
    }

    #response_headers_policy_id = aws_cloudfront_response_headers_policy.custom_headers_policy_html.id

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "/todo"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "api"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "all"
      }
    }

    #response_headers_policy_id = aws_cloudfront_response_headers_policy.custom_headers_policy_html.id

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "/todo/*/complete"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "api"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "all"
      }
    }

    #response_headers_policy_id = aws_cloudfront_response_headers_policy.custom_headers_policy_html.id

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "/todo/*"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "api"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "all"
      }
    }

    #response_headers_policy_id = aws_cloudfront_response_headers_policy.custom_headers_policy_html.id

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "/todos"
    allowed_methods  = ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "api"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]

      cookies {
        forward = "all"
      }
    }

    #response_headers_policy_id = aws_cloudfront_response_headers_policy.custom_headers_policy_html.id

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none" 
    }
  }

  tags = {
    Environment = var.landscape
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}