#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class CloseLoopAPITester:
    def __init__(self, base_url="https://call-review-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.workspace_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method, endpoint, data=None, params=None):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, params=params, timeout=30)
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def test_api_health(self):
        """Test API health endpoint"""
        response = self.make_request('GET', '')
        if response and response.status_code == 200:
            data = response.json()
            success = "CloseLoop API" in data.get("message", "")
            self.log_test("API Health Check", success, f"Status: {response.status_code}")
            return success
        else:
            self.log_test("API Health Check", False, f"Failed to connect or bad response")
            return False

    def test_signup(self):
        """Test user signup"""
        test_data = {
            "email": "test@closeloop.com",
            "password": "testpassword123",
            "name": "Test User",
            "company_name": "Test Company Inc"
        }
        
        response = self.make_request('POST', 'auth/signup', test_data)
        if response and response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            user_data = data.get("user", {})
            self.user_id = user_data.get("id")
            self.workspace_id = user_data.get("workspace_id")
            
            success = bool(self.token and self.user_id and self.workspace_id)
            self.log_test("User Signup", success, f"Token received: {bool(self.token)}")
            return success
        else:
            # Try login instead (user might already exist)
            return self.test_login()

    def test_login(self):
        """Test user login"""
        test_data = {
            "email": "test@closeloop.com",
            "password": "testpassword123"
        }
        
        response = self.make_request('POST', 'auth/login', test_data)
        if response and response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            user_data = data.get("user", {})
            self.user_id = user_data.get("id")
            self.workspace_id = user_data.get("workspace_id")
            
            success = bool(self.token and self.user_id and self.workspace_id)
            self.log_test("User Login", success, f"Token received: {bool(self.token)}")
            return success
        else:
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_auth_me(self):
        """Test get current user"""
        if not self.token:
            self.log_test("Get Current User", False, "No token available")
            return False
            
        response = self.make_request('GET', 'auth/me')
        if response and response.status_code == 200:
            data = response.json()
            success = data.get("email") == "test@closeloop.com"
            self.log_test("Get Current User", success, f"Email: {data.get('email')}")
            return success
        else:
            self.log_test("Get Current User", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_demo_request(self):
        """Test demo request submission"""
        demo_data = {
            "full_name": "John Doe",
            "work_email": "john@example.com",
            "company_name": "Example Corp",
            "company_size": "50-100",
            "role": "Sales Manager",
            "crm_used": "HubSpot",
            "message": "Interested in learning more about CloseLoop"
        }
        
        response = self.make_request('POST', 'demo-request', demo_data)
        if response and response.status_code == 200:
            data = response.json()
            success = "request_id" in data
            self.log_test("Demo Request", success, f"Request ID: {data.get('request_id', 'None')}")
            return success
        else:
            self.log_test("Demo Request", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_user_stats(self):
        """Test user stats endpoint"""
        if not self.token:
            self.log_test("User Stats", False, "No token available")
            return False
            
        response = self.make_request('GET', 'user/stats')
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ["pending_count", "sent_today", "total_calls"]
            success = all(field in data for field in required_fields)
            self.log_test("User Stats", success, f"Fields: {list(data.keys())}")
            return success
        else:
            self.log_test("User Stats", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_calls_crud(self):
        """Test calls CRUD operations"""
        if not self.token:
            self.log_test("Calls CRUD", False, "No token available")
            return False

        # Test create call
        call_data = {
            "title": "Test Discovery Call",
            "contact_name": "Sarah Chen",
            "contact_email": "sarah@acme.com",
            "contact_company": "Acme Inc",
            "contact_role": "CTO",
            "duration_seconds": 1800,
            "transcript_text": "[00:00] Rep: Hello Sarah, thanks for joining today.\n[00:15] Sarah: Thanks for having me. Excited to learn about CloseLoop.\n[00:30] Rep: Great! Let me start by understanding your current sales process.\n[01:00] Sarah: We use HubSpot but struggle with follow-up consistency.\n[01:30] Rep: That's exactly what CloseLoop helps with. Can I send you our compliance documentation?\n[02:00] Sarah: Yes, that would be helpful. Also, let's schedule a demo next week."
        }
        
        response = self.make_request('POST', 'calls', call_data)
        if not response or response.status_code != 200:
            self.log_test("Create Call", False, f"Status: {response.status_code if response else 'No response'}")
            return False
        
        call_id = response.json().get("id")
        if not call_id:
            self.log_test("Create Call", False, "No call ID returned")
            return False
        
        self.log_test("Create Call", True, f"Call ID: {call_id}")
        
        # Wait for AI processing (it should be quick with mock data)
        time.sleep(2)
        
        # Test get call details
        response = self.make_request('GET', f'calls/{call_id}')
        if response and response.status_code == 200:
            call_details = response.json()
            has_ai_outputs = bool(call_details.get("ai_outputs"))
            has_transcript = bool(call_details.get("transcript"))
            self.log_test("Get Call Details", True, f"AI outputs: {has_ai_outputs}, Transcript: {has_transcript}")
            
            # Test approval workflow
            if has_ai_outputs:
                # Test individual approval
                approval_data = {
                    "item_type": "email",
                    "approved": True
                }
                response = self.make_request('POST', f'calls/{call_id}/approve', approval_data)
                success = response and response.status_code == 200
                self.log_test("Approve Email", success, f"Status: {response.status_code if response else 'No response'}")
                
                # Test approve all
                response = self.make_request('POST', f'calls/{call_id}/approve-all')
                success = response and response.status_code == 200
                self.log_test("Approve All", success, f"Status: {response.status_code if response else 'No response'}")
            
        else:
            self.log_test("Get Call Details", False, f"Status: {response.status_code if response else 'No response'}")
        
        # Test get all calls
        response = self.make_request('GET', 'calls')
        if response and response.status_code == 200:
            calls = response.json()
            success = isinstance(calls, list) and len(calls) > 0
            self.log_test("Get All Calls", success, f"Found {len(calls)} calls")
        else:
            self.log_test("Get All Calls", False, f"Status: {response.status_code if response else 'No response'}")
        
        return True

    def test_vault_operations(self):
        """Test data vault operations (admin only)"""
        if not self.token:
            self.log_test("Vault Operations", False, "No token available")
            return False

        # Test get documents
        response = self.make_request('GET', 'vault')
        if response and response.status_code == 200:
            docs = response.json()
            self.log_test("Get Vault Documents", True, f"Found {len(docs)} documents")
            
            # Test create document
            doc_data = {
                "filename": "SOC2_Compliance.pdf",
                "tags": ["compliance", "security"],
                "intent_triggers": ["compliance", "security", "soc2"],
                "content_preview": "SOC 2 Type II compliance documentation..."
            }
            
            response = self.make_request('POST', 'vault', doc_data)
            if response and response.status_code == 200:
                doc_id = response.json().get("id")
                self.log_test("Create Document", True, f"Document ID: {doc_id}")
                
                # Test toggle document
                if doc_id:
                    response = self.make_request('PATCH', f'vault/{doc_id}/toggle')
                    success = response and response.status_code == 200
                    self.log_test("Toggle Document", success, f"Status: {response.status_code if response else 'No response'}")
                
            else:
                self.log_test("Create Document", False, f"Status: {response.status_code if response else 'No response'}")
        else:
            self.log_test("Get Vault Documents", False, f"Status: {response.status_code if response else 'No response'}")

    def test_admin_operations(self):
        """Test admin operations"""
        if not self.token:
            self.log_test("Admin Operations", False, "No token available")
            return False

        # Test get team
        response = self.make_request('GET', 'admin/team')
        if response and response.status_code == 200:
            team = response.json()
            self.log_test("Get Team", True, f"Found {len(team)} members")
        else:
            self.log_test("Get Team", False, f"Status: {response.status_code if response else 'No response'}")

        # Test get workspace settings
        response = self.make_request('GET', 'admin/settings')
        if response and response.status_code == 200:
            settings = response.json()
            self.log_test("Get Workspace Settings", True, f"Settings: {bool(settings)}")
        else:
            self.log_test("Get Workspace Settings", False, f"Status: {response.status_code if response else 'No response'}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting CloseLoop API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Basic connectivity
        if not self.test_api_health():
            print("❌ API health check failed. Stopping tests.")
            return False
        
        # Authentication tests
        if not self.test_signup():
            print("❌ Authentication failed. Stopping tests.")
            return False
        
        self.test_auth_me()
        
        # Public endpoints
        self.test_demo_request()
        
        # User endpoints
        self.test_user_stats()
        
        # Core functionality
        self.test_calls_crud()
        
        # Admin functionality
        self.test_vault_operations()
        self.test_admin_operations()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = CloseLoopAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0,
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())