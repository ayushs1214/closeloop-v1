"""
CloseLoop API Tests - Supabase Auth & Role-Based Access Control
Tests: Authentication (Supabase), Platform Routes (superuser), Admin Routes, User Routes
"""
import pytest
import requests
import os
import uuid
from datetime import datetime
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    raise ValueError("REACT_APP_BACKEND_URL environment variable is required")

# Test credentials - Supabase Auth
SUPERUSER_EMAIL = "superadmin@closeloop.io"
SUPERUSER_PASSWORD = "SuperPass123!"

CLIENT_ADMIN_EMAIL = "sarah@technova.io"
CLIENT_ADMIN_PASSWORD = "ClientPass123!"

DEMO_USER_EMAIL = "demo_user@testdemo.com"
DEMO_USER_PASSWORD = "DemoPass123!"

# Sample transcript for AI testing
SAMPLE_TRANSCRIPT = """[00:00:15] Rep: Hi Sarah, thanks for taking the time to speak with me today about TechStart's needs.
[00:00:25] Sarah Chen: Of course, we're excited to explore how CloseLoop can help streamline our sales process.
[00:01:10] Rep: I understand you've been dealing with some challenges in your current setup. Can you tell me more about that?
[00:01:30] Sarah Chen: We're struggling with our current process. We need better compliance documentation and our pricing discussions are always messy. We don't have SOC2 compliance yet and that's a problem with enterprise clients.
[00:02:15] Rep: I totally understand. Many of our clients face similar challenges. We actually have a SOC2 compliance certificate that I can share with you.
[00:02:45] Sarah Chen: That would be great. Can you also send over your pricing sheet? We need to review it with our CFO before the budget meeting next week.
[00:03:20] Rep: Absolutely, I'll send that over right away. We also have some case studies that might be helpful.
[00:03:45] Sarah Chen: Yes, please share any case studies you have. Especially if you have one from a company like Acme Corp that we could review.
[00:04:15] Rep: Perfect. I'll prepare the enterprise pricing sheet, the SOC2 certificate, and the Acme Corp case study for you.
[00:04:45] Sarah Chen: When can we schedule the demo? We're hoping to make a decision by the end of this quarter.
[00:05:10] Rep: Let me check my calendar. I can do next Tuesday at 2 PM. Does that work for you?
[00:05:30] Sarah Chen: That works. Please send me a calendar invite.
[00:05:45] Rep: Will do. I'll follow up with all the documents and the meeting invite today.
[00:06:00] Sarah Chen: Great, looking forward to it. Thanks!"""


class TestHealthCheck:
    """Health check and API connectivity tests"""
    
    def test_api_root(self):
        """Test API root endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "operational"
        print(f"SUCCESS: API root accessible - {data}")


class TestSupabaseAuth:
    """Supabase Authentication tests"""
    
    def test_login_superuser(self):
        """Test login with superuser credentials via Supabase"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERUSER_EMAIL,
            "password": SUPERUSER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert data["user"]["role"] == "superuser", f"Expected superuser role, got {data['user']['role']}"
        assert data["user"]["workspace_id"] is None, "Superuser should have no workspace_id"
        print(f"SUCCESS: Superuser login successful - role={data['user']['role']}")
    
    def test_login_client_admin(self):
        """Test login with client admin (superadmin) credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_ADMIN_EMAIL,
            "password": CLIENT_ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["user"]["role"] == "superadmin", f"Expected superadmin role, got {data['user']['role']}"
        assert data["user"]["workspace_id"] is not None, "Client admin should have workspace_id"
        print(f"SUCCESS: Client admin login successful - role={data['user']['role']}, workspace={data['user']['workspace_id']}")
    
    def test_login_demo_user(self):
        """Test login with demo user credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": DEMO_USER_EMAIL,
            "password": DEMO_USER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        print(f"SUCCESS: Demo user login successful - role={data['user']['role']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Invalid credentials correctly rejected")
    
    def test_signup_creates_user(self):
        """Test signup creates new user via Supabase admin API + MongoDB"""
        timestamp = int(time.time())
        unique_email = f"test_signup_{timestamp}@closeloop.io"
        
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "email": unique_email,
            "password": "TestPass123!",
            "name": "Test Signup User",
            "company_name": "Test Signup Company"
        })
        assert response.status_code == 200, f"Signup failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["role"] == "superadmin", "New signup should be superadmin of their workspace"
        assert data["user"]["workspace_id"] is not None, "New signup should have workspace created"
        print(f"SUCCESS: Signup created user {unique_email} with workspace {data['user']['workspace_id']}")
    
    def test_get_me_with_token(self):
        """Test /auth/me returns user profile from MongoDB"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERUSER_EMAIL,
            "password": SUPERUSER_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == SUPERUSER_EMAIL
        assert data["role"] == "superuser"
        print(f"SUCCESS: /auth/me returned user - email={data['email']}, role={data['role']}")


class TestPlatformSetup:
    """Platform setup tests - first superuser creation"""
    
    def test_setup_already_initialized(self):
        """Test /platform/setup returns 400 when platform already initialized"""
        response = requests.post(f"{BASE_URL}/api/platform/setup", json={
            "email": "another_superuser@closeloop.io",
            "password": "AnotherPass123!",
            "name": "Another Superuser"
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "already initialized" in response.json().get("detail", "").lower()
        print("SUCCESS: /platform/setup correctly rejects duplicate setup")


class TestPlatformRoutesSuperuserOnly:
    """Platform routes - superuser only access"""
    
    @pytest.fixture
    def superuser_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERUSER_EMAIL,
            "password": SUPERUSER_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def client_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_ADMIN_EMAIL,
            "password": CLIENT_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_workspaces_superuser(self, superuser_token):
        """Test GET /platform/workspaces returns workspaces list for superuser"""
        response = requests.get(f"{BASE_URL}/api/platform/workspaces", headers={
            "Authorization": f"Bearer {superuser_token}"
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        workspaces = response.json()
        assert isinstance(workspaces, list)
        print(f"SUCCESS: Superuser can access workspaces - found {len(workspaces)} workspaces")
        for ws in workspaces:
            assert "id" in ws
            assert "name" in ws
            assert "member_count" in ws
            assert "call_count" in ws
            print(f"  - {ws['name']}: {ws['member_count']} members, {ws['call_count']} calls")
    
    def test_get_workspaces_rejected_for_non_superuser(self, client_admin_token):
        """Test GET /platform/workspaces rejects non-superuser"""
        response = requests.get(f"{BASE_URL}/api/platform/workspaces", headers={
            "Authorization": f"Bearer {client_admin_token}"
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("SUCCESS: Platform workspaces correctly rejects non-superuser")
    
    def test_get_stats_superuser(self, superuser_token):
        """Test GET /platform/stats returns platform-wide statistics"""
        response = requests.get(f"{BASE_URL}/api/platform/stats", headers={
            "Authorization": f"Bearer {superuser_token}"
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        stats = response.json()
        assert "total_workspaces" in stats
        assert "total_users" in stats
        assert "total_calls" in stats
        assert "total_sent" in stats
        assert "total_pending" in stats
        print(f"SUCCESS: Platform stats - workspaces={stats['total_workspaces']}, users={stats['total_users']}, calls={stats['total_calls']}")
    
    def test_get_stats_rejected_for_non_superuser(self, client_admin_token):
        """Test GET /platform/stats rejects non-superuser"""
        response = requests.get(f"{BASE_URL}/api/platform/stats", headers={
            "Authorization": f"Bearer {client_admin_token}"
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("SUCCESS: Platform stats correctly rejects non-superuser")
    
    def test_get_superusers_list(self, superuser_token):
        """Test GET /platform/superusers returns list of superusers"""
        response = requests.get(f"{BASE_URL}/api/platform/superusers", headers={
            "Authorization": f"Bearer {superuser_token}"
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        superusers = response.json()
        assert isinstance(superusers, list)
        assert len(superusers) >= 1
        print(f"SUCCESS: Found {len(superusers)} superusers")
    
    def test_create_workspace_superuser(self, superuser_token):
        """Test POST /platform/workspaces creates workspace + admin user"""
        timestamp = int(time.time())
        response = requests.post(f"{BASE_URL}/api/platform/workspaces", 
            json={
                "company_name": f"TEST_NewCompany_{timestamp}",
                "admin_email": f"admin_{timestamp}@newcompany.io",
                "admin_name": f"Admin User {timestamp}",
                "admin_password": "AdminPass123!"
            },
            headers={"Authorization": f"Bearer {superuser_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "workspace_id" in data
        assert "admin_id" in data
        print(f"SUCCESS: Created workspace {data['workspace_id']} with admin {data['admin_id']}")
    
    def test_create_superuser_superuser(self, superuser_token):
        """Test POST /platform/superusers creates new superuser"""
        timestamp = int(time.time())
        response = requests.post(f"{BASE_URL}/api/platform/superusers", 
            json={
                "email": f"new_superuser_{timestamp}@closeloop.io",
                "password": "SuperPass123!",
                "name": f"New Superuser {timestamp}"
            },
            headers={"Authorization": f"Bearer {superuser_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "id" in data
        print(f"SUCCESS: Created superuser {data['id']}")


class TestAdminRoutes:
    """Admin routes - superadmin access"""
    
    @pytest.fixture
    def client_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_ADMIN_EMAIL,
            "password": CLIENT_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def demo_user_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": DEMO_USER_EMAIL,
            "password": DEMO_USER_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_team_admin(self, client_admin_token):
        """Test GET /admin/team returns team members for workspace"""
        response = requests.get(f"{BASE_URL}/api/admin/team", headers={
            "Authorization": f"Bearer {client_admin_token}"
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        team = response.json()
        assert isinstance(team, list)
        print(f"SUCCESS: Found {len(team)} team members")
        for member in team:
            assert "id" in member
            assert "email" in member
            assert "role" in member
            assert "status" in member
            print(f"  - {member['name']} ({member['email']}): role={member['role']}, status={member['status']}")
    
    def test_invite_team_member(self, client_admin_token):
        """Test POST /admin/team/invite invites new team member"""
        timestamp = int(time.time())
        response = requests.post(f"{BASE_URL}/api/admin/team/invite", 
            json={
                "email": f"invited_{timestamp}@test.io",
                "role": "rep"
            },
            headers={"Authorization": f"Bearer {client_admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "invite_id" in data
        print(f"SUCCESS: Invite sent, invite_id={data['invite_id']}")
    
    def test_get_performance_admin(self, client_admin_token):
        """Test GET /admin/performance returns team performance metrics"""
        response = requests.get(f"{BASE_URL}/api/admin/performance", headers={
            "Authorization": f"Bearer {client_admin_token}"
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        performance = response.json()
        assert isinstance(performance, list)
        print(f"SUCCESS: Found performance data for {len(performance)} team members")


class TestUserRoutes:
    """User routes - notification settings, onboarding"""
    
    @pytest.fixture
    def client_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_ADMIN_EMAIL,
            "password": CLIENT_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_notifications(self, client_admin_token):
        """Test GET /user/notifications returns notification settings"""
        response = requests.get(f"{BASE_URL}/api/user/notifications", headers={
            "Authorization": f"Bearer {client_admin_token}"
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        notifications = response.json()
        assert "email_on_new_call" in notifications
        assert "email_on_approval" in notifications
        assert "email_on_task_due" in notifications
        assert "email_weekly_digest" in notifications
        print(f"SUCCESS: Notification settings - {notifications}")
    
    def test_update_notifications(self, client_admin_token):
        """Test PUT /user/notifications saves notification toggle states"""
        new_settings = {
            "email_on_new_call": False,
            "email_on_approval": True,
            "email_on_task_due": True,
            "email_weekly_digest": False
        }
        response = requests.put(f"{BASE_URL}/api/user/notifications", 
            json=new_settings,
            headers={"Authorization": f"Bearer {client_admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["email_on_new_call"] == False
        assert data["email_on_task_due"] == True
        print(f"SUCCESS: Notification settings updated - {data}")
    
    def test_get_onboarding(self, client_admin_token):
        """Test GET /user/onboarding returns onboarding state"""
        response = requests.get(f"{BASE_URL}/api/user/onboarding", headers={
            "Authorization": f"Bearer {client_admin_token}"
        })
        assert response.status_code == 200, f"Failed: {response.text}"
        onboarding = response.json()
        assert "onboarding_completed" in onboarding
        print(f"SUCCESS: Onboarding state - {onboarding}")
    
    def test_update_onboarding(self, client_admin_token):
        """Test PUT /user/onboarding saves onboarding progress"""
        new_onboarding = {
            "company_size": "11-50",
            "crm_used": "HubSpot",
            "calls_per_week": "6-15",
            "onboarding_completed": True
        }
        response = requests.put(f"{BASE_URL}/api/user/onboarding", 
            json=new_onboarding,
            headers={"Authorization": f"Bearer {client_admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["onboarding_completed"] == True
        assert data["crm_used"] == "HubSpot"
        print(f"SUCCESS: Onboarding updated - {data}")


class TestCallsAndApproval:
    """Calls CRUD and approval workflow tests"""
    
    @pytest.fixture
    def client_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_ADMIN_EMAIL,
            "password": CLIENT_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_create_call_with_transcript(self, client_admin_token):
        """Test POST /calls creates call with AI outputs when transcript provided"""
        timestamp = int(time.time())
        call_data = {
            "title": f"TEST_Discovery Call {timestamp}",
            "contact_name": "Test Contact",
            "contact_email": "contact@test.io",
            "contact_company": "Test Corp",
            "contact_role": "VP Sales",
            "duration_seconds": 360,
            "transcript_text": SAMPLE_TRANSCRIPT
        }
        
        response = requests.post(f"{BASE_URL}/api/calls", 
            json=call_data,
            headers={"Authorization": f"Bearer {client_admin_token}"}
        )
        assert response.status_code == 200, f"Create call failed: {response.text}"
        data = response.json()
        assert data["status"] in ["pending", "processing"]
        print(f"SUCCESS: Created call {data['id']} with status={data['status']}")
        return data["id"]
    
    def test_get_call_detail_with_ai_outputs(self, client_admin_token):
        """Test GET /calls/{id} returns full call details with AI outputs"""
        # Create a call first
        timestamp = int(time.time())
        call_data = {
            "title": f"TEST_AI Call {timestamp}",
            "contact_name": "AI Test",
            "contact_email": "ai@test.io",
            "transcript_text": SAMPLE_TRANSCRIPT
        }
        
        create_response = requests.post(f"{BASE_URL}/api/calls", 
            json=call_data,
            headers={"Authorization": f"Bearer {client_admin_token}"}
        )
        call_id = create_response.json()["id"]
        
        # Get call detail
        response = requests.get(f"{BASE_URL}/api/calls/{call_id}", 
            headers={"Authorization": f"Bearer {client_admin_token}"}
        )
        assert response.status_code == 200
        call = response.json()
        
        # Verify AI outputs
        ai = call.get("ai_outputs", {})
        print(f"SUCCESS: Call {call_id} AI outputs:")
        print(f"  - email_draft: {bool(ai.get('email_draft'))}")
        print(f"  - documents: {len(ai.get('documents', []))} matched")
        print(f"  - crm_notes: {len(ai.get('crm_notes', []))} notes")
        print(f"  - tasks: {len(ai.get('tasks', []))} tasks")
        print(f"  - summary: {bool(ai.get('summary'))}")
    
    def test_approve_all(self, client_admin_token):
        """Test POST /calls/{id}/approve-all approves all items"""
        # Create a call
        timestamp = int(time.time())
        create_response = requests.post(f"{BASE_URL}/api/calls", 
            json={
                "title": f"TEST_Approve All {timestamp}",
                "contact_name": "Approve Test",
                "contact_email": "approve@test.io",
                "transcript_text": SAMPLE_TRANSCRIPT
            },
            headers={"Authorization": f"Bearer {client_admin_token}"}
        )
        call_id = create_response.json()["id"]
        
        # Approve all
        response = requests.post(f"{BASE_URL}/api/calls/{call_id}/approve-all", 
            headers={"Authorization": f"Bearer {client_admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "sent"
        print(f"SUCCESS: Approve all set status to 'sent'")


class TestCleanup:
    """Clean up test data"""
    
    @pytest.fixture
    def client_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": CLIENT_ADMIN_EMAIL,
            "password": CLIENT_ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_cleanup_test_calls(self, client_admin_token):
        """Clean up TEST_ prefixed calls"""
        response = requests.get(f"{BASE_URL}/api/calls", 
            headers={"Authorization": f"Bearer {client_admin_token}"}
        )
        calls = response.json()
        
        deleted = 0
        for call in calls:
            if call.get("title", "").startswith("TEST_"):
                del_response = requests.delete(f"{BASE_URL}/api/calls/{call['id']}", 
                    headers={"Authorization": f"Bearer {client_admin_token}"}
                )
                if del_response.status_code == 200:
                    deleted += 1
        
        print(f"SUCCESS: Cleaned up {deleted} test calls")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
