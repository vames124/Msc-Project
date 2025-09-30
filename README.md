# E-commerce Demo Application

A modern e-commerce demo application built with vanilla JavaScript frontend and Express.js backend, designed for AWS deployment with focus on pipeline automation and security.

## 🏗️ Architecture

This application follows **Option 2: Moderate (Frontend + Light Backend)** architecture:

- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Backend**: Express.js API with in-memory storage
- **Deployment**: AWS Elastic Beanstalk (full-stack application)
- **Testing**: Jest for API endpoint testing
- **Security**: Helmet.js, CORS, input validation

## ✨ Features

### Frontend
- 🛍️ Product catalog with search functionality
- 🛒 Shopping cart with quantity management
- ❤️ Favorites system
- 📱 Responsive design with modern UI
- 🔔 Toast notifications
- ⚡ Fast loading with optimized assets

### Backend
- 🚀 RESTful API endpoints
- 🛒 Cart management (in-memory)
- ❤️ Favorites management
- 🔍 Product search and filtering
- 🏥 Health check endpoint
- 🛡️ Security middleware (Helmet, CORS)

### AWS Integration
- ☁️ Elastic Beanstalk for full-stack application hosting
- 🪣 S3 for deployment artifact storage
- 🔐 IAM roles and security groups
- 📊 Monitoring and logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS CLI configured with appropriate permissions
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up AWS environment**
   ```bash
   npm run setup:aws
   ```

4. **Run locally**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Or production mode
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API Health: http://localhost:3000/api/health

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

The test suite includes:
- API endpoint testing
- Cart functionality testing
- Favorites system testing
- Error handling testing
- Health check testing

## 🚀 Deployment with GitHub Actions

### Prerequisites

1. **AWS Account Setup**
   - Create an AWS account
   - Create an IAM user with appropriate permissions
   - Generate access keys

2. **GitHub Secrets Configuration**
   Add these secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `SNYK_TOKEN`: (Optional) For security scanning

### Deployment Process

1. **Initial Infrastructure Setup** (one-time)
   - Go to GitHub Actions tab
   - Run the "Setup AWS Infrastructure" workflow manually
   - Select your preferred AWS region
   - This creates all necessary AWS resources

2. **Automatic Deployment**
   - Push code to `main` or `master` branch
   - GitHub Actions automatically:
     - ✅ Runs tests and security scans
     - 🏗️ Builds the frontend assets
     - ☁️ Deploys full application to Elastic Beanstalk
     - 🔧 Configures all AWS resources
     - 📊 Sets up monitoring

### Manual Deployment

If you need to trigger deployment manually:
1. Go to GitHub Actions tab
2. Select "Deploy to AWS" workflow
3. Click "Run workflow"
4. Select the branch to deploy

### Workflow Features

- **Multi-Node Testing**: Tests on Node.js 18 and 20
- **Security Scanning**: npm audit and Snyk integration
- **Performance Testing**: Basic performance validation
- **Single Deployment**: Full-stack application deployed to Elastic Beanstalk
- **Infrastructure as Code**: All AWS resources created via workflows
- **Rollback Support**: Easy version management with Elastic Beanstalk

## 📁 Project Structure

```
ecommerce-demo/
├── client/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── app.js            # JavaScript application
├── server/                # Backend files
│   └── index.js          # Express server
├── tests/                 # Test files
│   ├── server.test.js    # API tests
│   └── setup.js          # Test setup
├── .github/workflows/     # GitHub Actions workflows
│   ├── deploy.yml        # Main deployment workflow
│   ├── test.yml          # Testing and building workflow
│   └── setup-infrastructure.yml # AWS infrastructure setup
├── dist/                  # Built frontend (generated)
├── package.json          # Dependencies and scripts
├── jest.config.js        # Jest configuration
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id

# Application Configuration
NODE_ENV=production
PORT=8080

# Elastic Beanstalk
EB_APPLICATION_NAME=ecommerce-demo
EB_ENVIRONMENT_NAME=ecommerce-demo-env

# S3
S3_BUCKET_NAME=ecommerce-demo-frontend

# Security
CORS_ORIGIN=*
```

### AWS Permissions

Your AWS IAM user needs the following permissions:
- Elastic Beanstalk full access
- S3 full access
- IAM role creation and management
- EC2 security group management
- CloudFront management (optional)

**Recommended IAM Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "elasticbeanstalk:*",
        "s3:*",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:CreateInstanceProfile",
        "iam:AddRoleToInstanceProfile",
        "ec2:CreateSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:DescribeVpcs",
        "ec2:DescribeSecurityGroups",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input validation**: Request body validation
- **Rate limiting**: API rate limiting (can be added)
- **Security groups**: AWS security group configuration
- **IAM roles**: Least privilege access

## 📊 Monitoring & Logging

The application includes:
- Health check endpoint (`/api/health`)
- Request logging with Morgan
- Error handling and logging
- AWS CloudWatch integration (via Elastic Beanstalk)

## 🔄 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

### Cart
- `GET /api/cart` - Get cart contents
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Favorites
- `GET /api/favorites` - Get favorites list
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:productId` - Remove from favorites

### Health
- `GET /api/health` - Health check endpoint

## 🐛 Troubleshooting

### Common Issues

1. **AWS Credentials Not Found**
   ```bash
   aws configure
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

3. **Build Failures**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **AWS Deployment Issues**
   - Check AWS CLI version: `aws --version`
   - Verify credentials: `aws sts get-caller-identity`
   - Check region configuration
   - Review IAM permissions

### Logs

- **Local development**: Check console output
- **AWS Elastic Beanstalk**: Check CloudWatch logs
- **S3**: Check S3 access logs (if enabled)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Unsplash for product images
- Font Awesome for icons
- AWS for hosting infrastructure
- Express.js and Node.js communities

---

**Note**: This is a demo application for educational purposes. For production use, consider adding:
- Database persistence
- User authentication
- Payment processing
- Advanced security measures
- Comprehensive error handling
- Performance monitoring
