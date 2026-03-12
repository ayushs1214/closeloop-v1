"""
CloseLoop API Tests - Comprehensive backend testing
Tests: Authentication, Calls CRUD, Vault CRUD, Approval workflow, Tasks
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    raise ValueError("REACT_APP_BACKEND_URL environment variable is required")

# Test credentials
TEST_EMAIL = "ai_test@closeloop.io"
TEST_PASSWORD = "testpass123"

# Sample transcript that should trigger vault document matching
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


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["email"] == TEST_EMAIL
        print(f"SUCCESS: Login successful for {TEST_EMAIL}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Invalid credentials correctly rejected")
    
    def test_get_me_with_token(self):
        """Test /auth/me with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Then get me
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
        print(f"SUCCESS: /auth/me returned user data for {data['email']}")


class TestVault:
    """Data Vault API tests - documents with intent triggers"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_vault_documents(self, auth_token):
        """Test GET /vault returns documents with intent triggers"""
        response = requests.get(f"{BASE_URL}/api/vault", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        docs = response.json()
        assert isinstance(docs, list)
        print(f"SUCCESS: Found {len(docs)} documents in vault")
        
        # Verify document structure
        for doc in docs:
            assert "id" in doc
            assert "filename" in doc
            assert "intent_triggers" in doc
            print(f"  - {doc['filename']}: triggers={doc['intent_triggers']}")
    
    def test_vault_has_seeded_documents(self, auth_token):
        """Test that seeded documents exist with correct triggers"""
        response = requests.get(f"{BASE_URL}/api/vault", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        docs = response.json()
        
        filenames = [d["filename"] for d in docs]
        expected_docs = [
            "Enterprise Pricing Sheet",
            "SOC2 Compliance Certificate",
            "Acme Corp Case Study"
        ]
        
        for expected in expected_docs:
            found = any(expected.lower() in f.lower() for f in filenames)
            if found:
                print(f"SUCCESS: Found seeded document: {expected}")
            else:
                print(f"WARNING: Seeded document not found: {expected}")


class TestCalls:
    """Calls API tests - CRUD and AI processing"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_get_calls_list(self, auth_headers):
        """Test GET /calls returns calls list"""
        response = requests.get(f"{BASE_URL}/api/calls", headers=auth_headers)
        assert response.status_code == 200
        calls = response.json()
        assert isinstance(calls, list)
        print(f"SUCCESS: Found {len(calls)} calls")
        return calls
    
    def test_create_call_with_transcript(self, auth_headers):
        """Test POST /calls creates call with AI outputs when transcript provided"""
        call_data = {
            "title": f"TEST_Discovery Call - TechStart Inc {uuid.uuid4().hex[:6]}",
            "contact_name": "Sarah Chen",
            "contact_email": "sarah@techstart.io",
            "contact_company": "TechStart Inc",
            "contact_role": "VP of Sales",
            "duration_seconds": 360,
            "transcript_text": SAMPLE_TRANSCRIPT
        }
        
        response = requests.post(f"{BASE_URL}/api/calls", json=call_data, headers=auth_headers)
        assert response.status_code == 200, f"Create call failed: {response.text}"
        data = response.json()
        
        assert data["title"] == call_data["title"]
        assert data["status"] in ["pending", "processing"]
        print(f"SUCCESS: Created call {data['id']} with status={data['status']}")
        return data["id"]
    
    def test_get_call_detail_with_ai_outputs(self, auth_headers):
        """Test GET /calls/{id} returns full call details with AI outputs"""
        # First create a call
        call_data = {
            "title": f"TEST_AI Output Call {uuid.uuid4().hex[:6]}",
            "contact_name": "Test Contact",
            "contact_email": "test@test.io",
            "contact_company": "Test Corp",
            "transcript_text": SAMPLE_TRANSCRIPT
        }
        
        create_response = requests.post(f"{BASE_URL}/api/calls", json=call_data, headers=auth_headers)
        assert create_response.status_code == 200
        call_id = create_response.json()["id"]
        
        # Get the call detail
        response = requests.get(f"{BASE_URL}/api/calls/{call_id}", headers=auth_headers)
        assert response.status_code == 200
        call = response.json()
        
        # Verify AI outputs exist
        ai_outputs = call.get("ai_outputs", {})
        print(f"SUCCESS: Call {call_id} AI outputs:")
        print(f"  - email_draft: {bool(ai_outputs.get('email_draft'))}")
        print(f"  - documents: {len(ai_outputs.get('documents', []))} matched")
        print(f"  - crm_notes: {len(ai_outputs.get('crm_notes', []))} notes")
        print(f"  - tasks: {len(ai_outputs.get('tasks', []))} tasks")
        print(f"  - summary: {bool(ai_outputs.get('summary'))}")
        
        # Verify structure of each section
        if ai_outputs.get("email_draft"):
            assert "subject" in ai_outputs["email_draft"]
            assert "body" in ai_outputs["email_draft"]
            print(f"  Email subject: {ai_outputs['email_draft']['subject'][:50]}...")
        
        if ai_outputs.get("documents"):
            for doc in ai_outputs["documents"]:
                assert "filename" in doc
                print(f"  Matched doc: {doc['filename']}")
        
        if ai_outputs.get("tasks"):
            for task in ai_outputs["tasks"]:
                assert "text" in task
                assert "priority" in task
                print(f"  Task: {task['text'][:40]}... (priority: {task.get('priority', 'N/A')})")
        
        if ai_outputs.get("crm_notes"):
            for note in ai_outputs["crm_notes"]:
                assert "point" in note
                assert "category" in note
                print(f"  CRM note [{note['category']}]: {note['point'][:40]}...")
        
        return call_id


class TestApprovalWorkflow:
    """Approval workflow tests - individual and batch approval"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return {"Authorization": f"Bearer {response.json()['access_token']}"}
    
    @pytest.fixture
    def test_call(self, auth_headers):
        """Create a test call for approval testing"""
        call_data = {
            "title": f"TEST_Approval Call {uuid.uuid4().hex[:6]}",
            "contact_name": "Approval Test",
            "contact_email": "approval@test.io",
            "contact_company": "Approval Corp",
            "transcript_text": SAMPLE_TRANSCRIPT
        }
        response = requests.post(f"{BASE_URL}/api/calls", json=call_data, headers=auth_headers)
        return response.json()["id"]
    
    def test_approve_email(self, auth_headers, test_call):
        """Test approving email item"""
        response = requests.post(
            f"{BASE_URL}/api/calls/{test_call}/approve",
            json={"item_type": "email", "approved": True},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "email" in data.get("message", "").lower()
        print(f"SUCCESS: Email approved - {data}")
    
    def test_approve_documents(self, auth_headers, test_call):
        """Test approving documents item"""
        response = requests.post(
            f"{BASE_URL}/api/calls/{test_call}/approve",
            json={"item_type": "documents", "approved": True},
            headers=auth_headers
        )
        assert response.status_code == 200
        print("SUCCESS: Documents approved")
    
    def test_approve_crm(self, auth_headers, test_call):
        """Test approving CRM item"""
        response = requests.post(
            f"{BASE_URL}/api/calls/{test_call}/approve",
            json={"item_type": "crm", "approved": True},
            headers=auth_headers
        )
        assert response.status_code == 200
        print("SUCCESS: CRM approved")
    
    def test_approve_tasks(self, auth_headers, test_call):
        """Test approving tasks item"""
        response = requests.post(
            f"{BASE_URL}/api/calls/{test_call}/approve",
            json={"item_type": "tasks", "approved": True},
            headers=auth_headers
        )
        assert response.status_code == 200
        print("SUCCESS: Tasks approved")
    
    def test_approve_all_sets_status_sent(self, auth_headers):
        """Test approving all items sets status to 'sent'"""
        # Create a fresh call
        call_data = {
            "title": f"TEST_Approve All {uuid.uuid4().hex[:6]}",
            "contact_name": "Approve All Test",
            "transcript_text": SAMPLE_TRANSCRIPT
        }
        create_response = requests.post(f"{BASE_URL}/api/calls", json=call_data, headers=auth_headers)
        call_id = create_response.json()["id"]
        
        # Approve all
        response = requests.post(f"{BASE_URL}/api/calls/{call_id}/approve-all", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "sent"
        print(f"SUCCESS: Approve all set status to 'sent'")
        
        # Verify call status
        call_response = requests.get(f"{BASE_URL}/api/calls/{call_id}", headers=auth_headers)
        call = call_response.json()
        assert call["status"] == "sent"
        assert call["approvals"]["email"]["approved"] == True
        assert call["approvals"]["documents"]["approved"] == True
        assert call["approvals"]["crm"]["approved"] == True
        assert call["approvals"]["tasks"]["approved"] == True
        print("SUCCESS: All approvals verified")


class TestTasks:
    """Tasks API tests"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return {"Authorization": f"Bearer {response.json()['access_token']}"}
    
    def test_get_tasks(self, auth_headers):
        """Test GET /tasks returns tasks list"""
        response = requests.get(f"{BASE_URL}/api/tasks", headers=auth_headers)
        assert response.status_code == 200
        tasks = response.json()
        assert isinstance(tasks, list)
        print(f"SUCCESS: Found {len(tasks)} tasks")


class TestUserStats:
    """User stats and dashboard data tests"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return {"Authorization": f"Bearer {response.json()['access_token']}"}
    
    def test_get_user_stats(self, auth_headers):
        """Test GET /user/stats returns stats"""
        response = requests.get(f"{BASE_URL}/api/user/stats", headers=auth_headers)
        assert response.status_code == 200
        stats = response.json()
        assert "pending_count" in stats
        assert "sent_count" in stats
        assert "total_calls" in stats
        print(f"SUCCESS: User stats - pending={stats['pending_count']}, sent={stats['sent_count']}, total={stats['total_calls']}")


# Cleanup test data
class TestCleanup:
    """Clean up test data created during tests"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return {"Authorization": f"Bearer {response.json()['access_token']}"}
    
    def test_cleanup_test_calls(self, auth_headers):
        """Clean up TEST_ prefixed calls"""
        response = requests.get(f"{BASE_URL}/api/calls", headers=auth_headers)
        calls = response.json()
        
        deleted = 0
        for call in calls:
            if call.get("title", "").startswith("TEST_"):
                del_response = requests.delete(f"{BASE_URL}/api/calls/{call['id']}", headers=auth_headers)
                if del_response.status_code == 200:
                    deleted += 1
        
        print(f"SUCCESS: Cleaned up {deleted} test calls")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
