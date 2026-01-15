import requests
import sys
import json
from datetime import datetime

class ContinentalAcademyAPITester:
    def __init__(self, base_url="https://eduplatform-93.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add auth token if available
        token_to_use = self.admin_token if use_admin and self.admin_token else self.token
        if token_to_use:
            test_headers['Authorization'] = f'Bearer {token_to_use}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text[:200]}")
                
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'endpoint': endpoint
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION ENDPOINTS")
        print("="*50)
        
        # Test user registration
        test_user_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✅ User token obtained: {self.token[:20]}...")
        
        # Test admin login
        admin_data = {
            "email": "admin@test.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_data
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   ✅ Admin token obtained: {self.admin_token[:20]}...")
        
        # Test /me endpoint
        if self.token:
            self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200
            )

    def test_programs_endpoints(self):
        """Test programs endpoints"""
        print("\n" + "="*50)
        print("TESTING PROGRAMS ENDPOINTS")
        print("="*50)
        
        # Get all programs (public)
        success, programs = self.run_test(
            "Get All Programs",
            "GET",
            "programs",
            200
        )
        
        # Test admin program creation
        if self.admin_token:
            program_data = {
                "name": "Test Program API",
                "description": "Test program created via API",
                "price": 29.99,
                "currency": "EUR",
                "features": ["Test feature 1", "Test feature 2"],
                "is_active": True
            }
            
            success, response = self.run_test(
                "Create Program (Admin)",
                "POST",
                "admin/programs",
                200,
                data=program_data,
                use_admin=True
            )
            
            if success and 'id' in response:
                program_id = response['id']
                
                # Test program update
                updated_data = {**program_data, "name": "Updated Test Program"}
                self.run_test(
                    "Update Program (Admin)",
                    "PUT",
                    f"admin/programs/{program_id}",
                    200,
                    data=updated_data,
                    use_admin=True
                )
                
                # Test program deletion
                self.run_test(
                    "Delete Program (Admin)",
                    "DELETE",
                    f"admin/programs/{program_id}",
                    200,
                    use_admin=True
                )

    def test_shop_endpoints(self):
        """Test shop endpoints"""
        print("\n" + "="*50)
        print("TESTING SHOP ENDPOINTS")
        print("="*50)
        
        # Get all products
        self.run_test(
            "Get All Shop Products",
            "GET",
            "shop/products",
            200
        )
        
        # Get products by category
        self.run_test(
            "Get TikTok Products",
            "GET",
            "shop/products?category=tiktok",
            200
        )
        
        # Test admin product creation
        if self.admin_token:
            product_data = {
                "title": "Test TikTok Account",
                "description": "Test account for API testing",
                "category": "tiktok",
                "price": 99.99,
                "currency": "EUR",
                "stats": {"followers": "10K", "engagement": "5%"},
                "images": [],
                "is_available": True
            }
            
            success, response = self.run_test(
                "Create Shop Product (Admin)",
                "POST",
                "admin/shop/products",
                200,
                data=product_data,
                use_admin=True
            )
            
            if success and 'id' in response:
                product_id = response['id']
                
                # Test get single product
                self.run_test(
                    "Get Single Product",
                    "GET",
                    f"shop/products/{product_id}",
                    200
                )
                
                # Test product deletion
                self.run_test(
                    "Delete Product (Admin)",
                    "DELETE",
                    f"admin/shop/products/{product_id}",
                    200,
                    use_admin=True
                )

    def test_content_endpoints(self):
        """Test content endpoints (FAQs, Results, Settings)"""
        print("\n" + "="*50)
        print("TESTING CONTENT ENDPOINTS")
        print("="*50)
        
        # Test FAQs
        self.run_test(
            "Get All FAQs",
            "GET",
            "faqs",
            200
        )
        
        # Test Results
        self.run_test(
            "Get All Results",
            "GET",
            "results",
            200
        )
        
        # Test Settings
        self.run_test(
            "Get Settings",
            "GET",
            "settings",
            200
        )
        
        # Test admin FAQ creation
        if self.admin_token:
            faq_data = {
                "question": "Test API Question?",
                "answer": "Test API Answer",
                "order": 999
            }
            
            success, response = self.run_test(
                "Create FAQ (Admin)",
                "POST",
                "admin/faqs",
                200,
                data=faq_data,
                use_admin=True
            )
            
            if success and 'id' in response:
                faq_id = response['id']
                
                # Test FAQ deletion
                self.run_test(
                    "Delete FAQ (Admin)",
                    "DELETE",
                    f"admin/faqs/{faq_id}",
                    200,
                    use_admin=True
                )

    def test_admin_endpoints(self):
        """Test admin-specific endpoints"""
        print("\n" + "="*50)
        print("TESTING ADMIN ENDPOINTS")
        print("="*50)
        
        if not self.admin_token:
            print("❌ No admin token available, skipping admin tests")
            return
        
        # Test get users
        self.run_test(
            "Get All Users (Admin)",
            "GET",
            "admin/users",
            200,
            use_admin=True
        )
        
        # Test analytics
        self.run_test(
            "Get Analytics (Admin)",
            "GET",
            "admin/analytics",
            200,
            use_admin=True
        )
        
        # Test seed data
        self.run_test(
            "Seed Demo Data (Admin)",
            "POST",
            "admin/seed",
            200,
            use_admin=True
        )

    def test_courses_endpoints(self):
        """Test courses endpoints"""
        print("\n" + "="*50)
        print("TESTING COURSES ENDPOINTS")
        print("="*50)
        
        # Get all courses
        self.run_test(
            "Get All Courses",
            "GET",
            "courses",
            200
        )

    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        print("\n" + "="*50)
        print("TESTING ANALYTICS ENDPOINTS")
        print("="*50)
        
        # Test event tracking
        event_data = {
            "event_type": "api_test",
            "page": "backend_test",
            "metadata": {"test": True}
        }
        
        self.run_test(
            "Track Analytics Event",
            "POST",
            "analytics/event",
            200,
            data=event_data
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Continental Academy API Tests")
        print(f"📍 Base URL: {self.base_url}")
        
        # Run test suites
        self.test_auth_endpoints()
        self.test_programs_endpoints()
        self.test_shop_endpoints()
        self.test_content_endpoints()
        self.test_courses_endpoints()
        self.test_analytics_endpoints()
        self.test_admin_endpoints()
        
        # Print final results
        print("\n" + "="*60)
        print("🏁 FINAL TEST RESULTS")
        print("="*60)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed tests ({len(self.failed_tests)}):")
            for test in self.failed_tests:
                error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
                print(f"   • {test['name']}: {error_msg}")
        else:
            print("\n🎉 All tests passed!")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ContinentalAcademyAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())