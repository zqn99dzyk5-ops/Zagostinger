"""
Continental Academy Backend API Tests
Tests for: Auth, Admin, Public endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@test.com"
ADMIN_PASSWORD = "admin123"
STUDENT_EMAIL = "student@test.com"
STUDENT_PASSWORD = "student123"

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        print(f"✓ Health check passed: {data['service']}")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_admin_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['email']}")
    
    def test_login_student_success(self):
        """Test student login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "user"
        print(f"✓ Student login successful: {data['user']['email']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")
    
    def test_login_missing_fields(self):
        """Test login with missing fields"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL
        })
        assert response.status_code == 400
        print("✓ Missing fields rejected correctly")
    
    def test_register_new_user(self):
        """Test user registration"""
        test_email = f"TEST_user_{int(time.time())}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": test_email,
            "password": "testpass123"
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_email.lower()
        print(f"✓ User registration successful: {test_email}")
    
    def test_register_duplicate_email(self):
        """Test registration with existing email"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Duplicate User",
            "email": ADMIN_EMAIL,
            "password": "testpass123"
        })
        assert response.status_code == 400
        print("✓ Duplicate email rejected correctly")
    
    def test_get_current_user(self):
        """Test getting current user with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ Get current user successful: {data['email']}")
    
    def test_get_current_user_no_token(self):
        """Test getting current user without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Unauthorized access rejected correctly")


class TestPublicEndpoints:
    """Public endpoint tests (no auth required)"""
    
    def test_get_programs(self):
        """Test getting public programs"""
        response = requests.get(f"{BASE_URL}/api/programs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get programs successful: {len(data)} programs")
    
    def test_get_courses(self):
        """Test getting public courses"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get courses successful: {len(data)} courses")
    
    def test_get_faqs(self):
        """Test getting FAQs"""
        response = requests.get(f"{BASE_URL}/api/faqs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get FAQs successful: {len(data)} FAQs")
    
    def test_get_results(self):
        """Test getting results"""
        response = requests.get(f"{BASE_URL}/api/results")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get results successful: {len(data)} results")
    
    def test_get_settings(self):
        """Test getting public settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "id" in data or "type" in data
        print(f"✓ Get settings successful")
    
    def test_get_shop_products(self):
        """Test getting shop products"""
        response = requests.get(f"{BASE_URL}/api/shop/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get shop products successful: {len(data)} products")
    
    def test_track_analytics_event(self):
        """Test tracking analytics event"""
        response = requests.post(f"{BASE_URL}/api/analytics/event", json={
            "event_type": "page_view",
            "page": "/test",
            "user_agent": "pytest"
        })
        assert response.status_code == 201
        print("✓ Analytics event tracked successfully")


class TestAdminEndpoints:
    """Admin endpoint tests (requires admin auth)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = login_response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_users(self):
        """Test getting all users (admin only)"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2  # At least admin and student
        print(f"✓ Get users successful: {len(data)} users")
    
    def test_get_analytics(self):
        """Test getting analytics (admin only)"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        print(f"✓ Get analytics successful: {data['total_users']} total users")
    
    def test_get_admin_programs(self):
        """Test getting programs (admin)"""
        response = requests.get(f"{BASE_URL}/api/admin/programs", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get admin programs successful: {len(data)} programs")
    
    def test_get_admin_courses(self):
        """Test getting courses (admin)"""
        response = requests.get(f"{BASE_URL}/api/admin/courses", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get admin courses successful: {len(data)} courses")
    
    def test_get_admin_shop_products(self):
        """Test getting shop products (admin)"""
        response = requests.get(f"{BASE_URL}/api/admin/shop/products", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get admin shop products successful: {len(data)} products")
    
    # CRUD Tests for Programs
    def test_create_program(self):
        """Test creating a program"""
        response = requests.post(f"{BASE_URL}/api/admin/programs", headers=self.headers, json={
            "name": "TEST_Program",
            "description": "Test program description",
            "price": 99.99,
            "currency": "EUR",
            "features": ["Feature 1", "Feature 2"],
            "is_active": True
        })
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "TEST_Program"
        assert "id" in data
        print(f"✓ Create program successful: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/programs/{data['id']}", headers=self.headers)
    
    def test_update_program(self):
        """Test updating a program"""
        # Create first
        create_response = requests.post(f"{BASE_URL}/api/admin/programs", headers=self.headers, json={
            "name": "TEST_Program_Update",
            "description": "Original description",
            "price": 50,
            "is_active": True
        })
        program_id = create_response.json()["id"]
        
        # Update
        response = requests.put(f"{BASE_URL}/api/admin/programs/{program_id}", headers=self.headers, json={
            "name": "TEST_Program_Updated",
            "description": "Updated description",
            "price": 75
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Program_Updated"
        assert data["price"] == 75
        print(f"✓ Update program successful")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/programs/{program_id}", headers=self.headers)
    
    def test_delete_program(self):
        """Test deleting a program"""
        # Create first
        create_response = requests.post(f"{BASE_URL}/api/admin/programs", headers=self.headers, json={
            "name": "TEST_Program_Delete",
            "description": "To be deleted",
            "price": 10,
            "is_active": True
        })
        program_id = create_response.json()["id"]
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/admin/programs/{program_id}", headers=self.headers)
        assert response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/admin/programs", headers=self.headers)
        programs = get_response.json()
        assert not any(p["id"] == program_id for p in programs)
        print(f"✓ Delete program successful")
    
    # CRUD Tests for Courses
    def test_create_course(self):
        """Test creating a course"""
        response = requests.post(f"{BASE_URL}/api/admin/courses", headers=self.headers, json={
            "title": "TEST_Course",
            "description": "Test course description",
            "program_id": "",
            "is_active": True
        })
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "TEST_Course"
        print(f"✓ Create course successful: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/courses/{data['id']}", headers=self.headers)
    
    def test_delete_course(self):
        """Test deleting a course"""
        # Create first
        create_response = requests.post(f"{BASE_URL}/api/admin/courses", headers=self.headers, json={
            "title": "TEST_Course_Delete",
            "description": "To be deleted",
            "is_active": True
        })
        course_id = create_response.json()["id"]
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/admin/courses/{course_id}", headers=self.headers)
        assert response.status_code == 200
        print(f"✓ Delete course successful")
    
    # CRUD Tests for Lessons
    def test_create_lesson(self):
        """Test creating a lesson"""
        # Create course first
        course_response = requests.post(f"{BASE_URL}/api/admin/courses", headers=self.headers, json={
            "title": "TEST_Course_For_Lesson",
            "description": "Course for lesson test",
            "is_active": True
        })
        course_id = course_response.json()["id"]
        
        # Create lesson
        response = requests.post(f"{BASE_URL}/api/admin/lessons", headers=self.headers, json={
            "title": "TEST_Lesson",
            "description": "Test lesson description",
            "course_id": course_id,
            "video_url": "https://youtube.com/watch?v=test",
            "order": 1,
            "is_free": False
        })
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "TEST_Lesson"
        print(f"✓ Create lesson successful: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/lessons/{data['id']}", headers=self.headers)
        requests.delete(f"{BASE_URL}/api/admin/courses/{course_id}", headers=self.headers)
    
    # CRUD Tests for Shop Products
    def test_create_shop_product(self):
        """Test creating a shop product"""
        response = requests.post(f"{BASE_URL}/api/admin/shop/products", headers=self.headers, json={
            "title": "TEST_Product",
            "description": "Test product description",
            "price": 29.99,
            "category": "accounts",
            "is_available": True
        })
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "TEST_Product"
        print(f"✓ Create shop product successful: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/shop/products/{data['id']}", headers=self.headers)
    
    def test_delete_shop_product(self):
        """Test deleting a shop product"""
        # Create first
        create_response = requests.post(f"{BASE_URL}/api/admin/shop/products", headers=self.headers, json={
            "title": "TEST_Product_Delete",
            "description": "To be deleted",
            "price": 10,
            "category": "accounts",
            "is_available": True
        })
        product_id = create_response.json()["id"]
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/admin/shop/products/{product_id}", headers=self.headers)
        assert response.status_code == 200
        print(f"✓ Delete shop product successful")
    
    # CRUD Tests for FAQs
    def test_create_faq(self):
        """Test creating a FAQ"""
        response = requests.post(f"{BASE_URL}/api/admin/faqs", headers=self.headers, json={
            "question": "TEST_Question?",
            "answer": "Test answer",
            "order": 1
        })
        assert response.status_code == 201
        data = response.json()
        assert data["question"] == "TEST_Question?"
        print(f"✓ Create FAQ successful: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/faqs/{data['id']}", headers=self.headers)
    
    def test_delete_faq(self):
        """Test deleting a FAQ"""
        # Create first
        create_response = requests.post(f"{BASE_URL}/api/admin/faqs", headers=self.headers, json={
            "question": "TEST_FAQ_Delete?",
            "answer": "To be deleted",
            "order": 1
        })
        faq_id = create_response.json()["id"]
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/admin/faqs/{faq_id}", headers=self.headers)
        assert response.status_code == 200
        print(f"✓ Delete FAQ successful")
    
    # CRUD Tests for Results
    def test_create_result(self):
        """Test creating a result"""
        response = requests.post(f"{BASE_URL}/api/admin/results", headers=self.headers, json={
            "image_url": "https://example.com/image.jpg",
            "caption": "TEST_Result",
            "order": 1
        })
        assert response.status_code == 201
        data = response.json()
        assert data["caption"] == "TEST_Result"
        print(f"✓ Create result successful: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/results/{data['id']}", headers=self.headers)
    
    # Settings Tests
    def test_update_settings(self):
        """Test updating settings"""
        response = requests.put(f"{BASE_URL}/api/admin/settings", headers=self.headers, json={
            "site_name": "TEST_Continental Academy",
            "hero_headline": "Test Headline"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["site_name"] == "TEST_Continental Academy"
        print(f"✓ Update settings successful")
    
    # User Management Tests
    def test_update_user_role(self):
        """Test updating user role"""
        # Get users first
        users_response = requests.get(f"{BASE_URL}/api/admin/users", headers=self.headers)
        users = users_response.json()
        student = next((u for u in users if u["email"] == STUDENT_EMAIL), None)
        
        if student:
            # Update role to admin
            response = requests.put(
                f"{BASE_URL}/api/admin/users/{student['id']}/role?role=admin",
                headers=self.headers
            )
            assert response.status_code == 200
            
            # Revert back to user
            requests.put(
                f"{BASE_URL}/api/admin/users/{student['id']}/role?role=user",
                headers=self.headers
            )
            print(f"✓ Update user role successful")
    
    def test_admin_access_denied_for_student(self):
        """Test that student cannot access admin endpoints"""
        # Login as student
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        student_token = login_response.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}
        
        # Try to access admin endpoint
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=student_headers)
        assert response.status_code == 403
        print("✓ Admin access denied for student correctly")


class TestProtectedCourseAccess:
    """Test protected course access"""
    
    def test_course_access_requires_auth(self):
        """Test that course details require authentication"""
        # First get a course ID
        courses_response = requests.get(f"{BASE_URL}/api/courses")
        courses = courses_response.json()
        
        if courses:
            course_id = courses[0]["id"]
            response = requests.get(f"{BASE_URL}/api/courses/{course_id}")
            assert response.status_code == 401
            print("✓ Course access requires authentication")
        else:
            print("⚠ No courses to test access control")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
