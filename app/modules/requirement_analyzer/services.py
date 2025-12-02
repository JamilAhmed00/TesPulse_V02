import google.generativeai as genai
import httpx
import base64
import json
import re
from typing import Optional, Dict, Any
from app.modules.requirement_analyzer.schemas import AdmissionCircularData
from app.core.config import settings


# Configure Gemini API
genai.configure(api_key=settings.gemini_api_key)


async def try_fetch_url(url: str) -> Optional[Dict[str, str]]:
    """
    Attempts to fetch a URL directly.
    If successful and the content is a PDF or Image, returns the base64 data and mimeType.
    Returns None if fetch fails or content is not a supported file type.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code != 200:
                return None
            
            content_type = response.headers.get('content-type', '').lower()
            
            # Only proceed if it is a PDF or Image
            if 'application/pdf' in content_type or content_type.startswith('image/'):
                content = response.content
                base64_data = base64.b64encode(content).decode('utf-8')
                return {
                    'data': base64_data,
                    'mimeType': content_type
                }
            return None
    except Exception:
        # Ignore errors, fallback to search
        return None


async def analyze_circular(url: str) -> tuple[AdmissionCircularData, str]:
    """
    Analyze a university admission circular from a URL.
    Uses Gemini Flash for OCR capabilities on PDFs/images.
    """
    # Use gemini-1.5-flash for OCR and document understanding (supports file uploads)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # PRE-PROCESSING: Attempt direct download of URL
    direct_file = await try_fetch_url(url)
    
    if direct_file:
        # CASE 2: File Analysis (Direct Analysis with OCR)
        prompt = """
        You are an expert at extracting structured data from university admission circulars.
        
        CRITICAL: Extract EVERY piece of information available in the document. Do NOT leave fields as null if the information exists in the document.
        
        IMAGE/PDF PROCESSING (OCR):
        - Perform DETAILED OCR to extract ALL text from the document, including headers, footers, tables, and fine print.
        - Read EVERY table carefully - GPA requirements are often in tables.
        - Extract department-wise requirements from ALL tables and sections.
        - Look for application dates, exam dates, fees, contact information in ALL parts of the document.
        - Pay special attention to:
          * Tables showing GPA requirements by department/unit
          * Application period dates
          * Exam dates and times
          * Fee information
          * Contact details (email, phone, address)
          * Quota information
          * Required documents list
          * Age limits
          * Subject requirements
        
        LANGUAGE & FORMATTING RULES:
        1. The content may be in **Bangla** or **English**.
        2. **Convert ALL Bangla numerals (০-৯) to English numbers (0-9)** for all GPA, Year, Fee, Age, and numeric fields.
        3. Extract department names in their original language (Bangla or English).
        4. Extract 'SSC', 'HSC', and 'Total' GPA requirements from tables and text.
        5. Identify 'Allowed Passing Years' (e.g., SSC 2021/22, HSC 2023/24) - look for phrases like "পাসের বছর", "Passing Year", etc.
        6. Extract exam dates, times, and venues if mentioned.
        7. Extract contact information (email, phone, address) if available.
        8. Extract quota information (freedom fighter, tribal, etc.) if mentioned.
        9. Extract required documents list if provided.
        10. Extract age limits if specified.
        
        EXTRACTION REQUIREMENTS (CRITICAL - READ CAREFULLY):
        - Extract EVERY field that exists in the document. NULL values should ONLY be used when information is completely absent.
        - For department requirements: Extract ALL departments/units mentioned. If there are multiple units (A, B, C, etc.), create separate entries for EACH.
        - For dates: Extract ALL dates mentioned (application start, end, exam dates). Format: "DD-MM-YYYY" or "YYYY-MM-DD".
        - For fees: Extract the exact amount. If different fees for different units, mention in the fee string (e.g., "A Unit: 1320, B Unit: 1100").
        - For GPA: Extract EXACT numbers from tables. If ranges are given, use the minimum requirement.
        - For years: Extract ALL mentioned years. Look for phrases like "SSC 2021, 2022, 2023" or "HSC 2023, 2024".
        - For exam information: Extract date, time, venue, and duration if ANY of these are mentioned.
        - For contact info: Extract email addresses (look for @), phone numbers, and addresses.
        - For quotas: Extract numbers for freedom fighter quota, tribal quota, etc. if mentioned.
        - For documents: Extract ALL required documents mentioned in any list.
        - For subjects: Extract ALL required subjects for each department.
        
        EXAMPLE OF GOOD EXTRACTION:
        If the document shows:
        - Application: 20-11-2025 to 07-12-2025
        - Exam: 16-01-2026, 17-01-2026
        - Fee: A Unit 1320, B Unit 1100
        - Minimum GPA: SSC 3.00, HSC 3.00, Total 7.00
        - Departments: A Unit (Science), B Unit (Arts), C Unit (Commerce)
        
        Then extract:
        - applicationPeriod: {"start": "20-11-2025", "end": "07-12-2025"}
        - examDate: "16-01-2026, 17-01-2026"
        - applicationFee: "A Unit: 1320, B Unit: 1100"
        - generalGpaRequirements: {"ssc": 3.0, "hsc": 3.0, "total": 7.0}
        - departmentWiseRequirements: [
            {"departmentName": "A Unit (Science)", ...},
            {"departmentName": "B Unit (Arts)", ...},
            {"departmentName": "C Unit (Commerce)", ...}
          ]
        
        Return a JSON object with the following structure (fill in ALL available information):
        {
            "universityName": "string",
            "circularLink": "string (The input URL)",
            "websiteId": "string (Official website domain)",
            "applicationPeriod": { "start": "string", "end": "string" },
            "examDate": "string",
            "examTime": "string (if mentioned)",
            "examVenue": "string (exam location/venue if mentioned)",
            "examDuration": "string (exam duration if mentioned)",
            "generalGpaRequirements": { "ssc": number, "hsc": number, "total": number, "with4thSubject": boolean },
            "yearRequirements": { "sscYears": ["string"], "hscYears": ["string"] },
            "departmentWiseRequirements": [
                { 
                    "departmentName": "string",
                    "departmentCode": "string (if available)",
                    "minGpaSSC": number, 
                    "minGpaHSC": number, 
                    "minGpaTotal": number, 
                    "requiredSubjects": ["string"], 
                    "specialConditions": "string",
                    "seatsTotal": number (if mentioned),
                    "seatsQuotaFreedomFighter": number (if mentioned),
                    "seatsQuotaTribal": number (if mentioned),
                    "seatsQuotaOther": number (if mentioned),
                    "admissionTestSubjects": ["string"] (subjects tested for this department),
                    "admissionTestFormat": "string" (MCQ, Written, etc.)
                }
            ],
            "applicationFee": "string",
            "rawSummary": "string (Summarize key info in 2-3 sentences)",
            "ageLimitMin": number (minimum age if mentioned),
            "ageLimitMax": number (maximum age if mentioned),
            "nationalityRequirement": "string (if specified)",
            "genderRequirement": "string (if specified)",
            "contactEmail": "string (if available)",
            "contactPhone": "string (if available)",
            "contactAddress": "string (if available)",
            "requiredDocuments": ["string"] (list of required documents),
            "quotaFreedomFighter": number (total freedom fighter quota seats if mentioned),
            "quotaTribal": number (total tribal quota seats if mentioned),
            "quotaOther": "string (other quota information)",
            "additionalNotes": "string (any other important notes)"
        }
        """
        
        # Create the file part using inline data (base64)
        from google.generativeai.types import HarmCategory, HarmBlockThreshold
        import tempfile
        import os
        
        # Save to temporary file and upload (Gemini API requires file path)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf' if 'pdf' in direct_file['mimeType'] else '.jpg') as tmp_file:
            tmp_file.write(base64.b64decode(direct_file['data']))
            tmp_path = tmp_file.name
        
        try:
            # Upload file to Gemini
            uploaded_file = genai.upload_file(
                path=tmp_path,
                mime_type=direct_file['mimeType']
            )
            
            response = model.generate_content(
                [prompt, uploaded_file],
                generation_config={
                    'response_mime_type': 'application/json',
                },
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
        finally:
            # Clean up temporary file and uploaded file
            try:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                if 'uploaded_file' in locals():
                    genai.delete_file(uploaded_file.name)
            except:
                pass
        
        # Handle response - extract text from various response formats
        response_text = None
        
        # Try different ways to get the response text
        if hasattr(response, 'text') and response.text:
            response_text = response.text
        elif hasattr(response, 'parts') and response.parts:
            # Response might be in parts
            for part in response.parts:
                if hasattr(part, 'text') and part.text:
                    response_text = part.text
                    break
        elif hasattr(response, 'candidates') and response.candidates and len(response.candidates) > 0:
            # Response might be in candidates
            candidate = response.candidates[0]
            if hasattr(candidate, 'content'):
                if hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'text') and part.text:
                            response_text = part.text
                            break
                elif hasattr(candidate.content, 'text'):
                    response_text = candidate.content.text
        
        if not response_text:
            # Last resort: try to convert to string
            try:
                response_text = str(response)
            except:
                raise Exception("No response generated from Gemini - unable to extract text")
        
        raw_response = response_text
        
        # Clean and parse JSON response
        json_str = response_text.strip()
        
        # Remove markdown code blocks if present
        if json_str.startswith('```'):
            # Remove opening and closing code blocks
            json_str = re.sub(r'^```(?:json)?\s*', '', json_str, flags=re.MULTILINE)
            json_str = re.sub(r'\s*```\s*$', '', json_str, flags=re.MULTILINE)
            json_str = json_str.strip()
        
        # Try to extract JSON object from text
        json_match = re.search(r'\{[\s\S]*\}', json_str)
        if json_match:
            json_str = json_match.group(0)
        
        # Parse JSON with better error handling and repair
        def repair_json(json_string):
            """Try to repair common JSON issues from OCR"""
            # Remove trailing commas before closing brackets/braces
            json_string = re.sub(r',(\s*[}\]])', r'\1', json_string)
            # Remove duplicate commas
            json_string = re.sub(r'([,{[])\s*,', r'\1', json_string)
            # Fix unclosed strings (try to close them)
            json_string = re.sub(r':\s*"([^"]*?)(?:\n|$)', r': "\1"', json_string)
            # Fix single quotes to double quotes (but be careful with apostrophes)
            json_string = re.sub(r"'([^']*?)':", r'"\1":', json_string)
            json_string = re.sub(r":\s*'([^']*?)'", r': "\1"', json_string)
            return json_string
        
        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            # Try to repair JSON
            repaired_json = repair_json(json_str)
            try:
                data = json.loads(repaired_json)
            except json.JSONDecodeError:
                # Try one more time with more aggressive repair
                # Extract just the JSON object part
                json_match = re.search(r'\{[\s\S]{0,50000}\}', json_str)  # Limit to 50k chars
                if json_match:
                    try:
                        data = json.loads(json_match.group(0))
                    except json.JSONDecodeError:
                        error_msg = f"JSON parse error at position {e.pos}: {str(e)}"
                        if len(json_str) > 1000:
                            error_msg += f"\nFirst 1000 chars: {json_str[:1000]}"
                        else:
                            error_msg += f"\nFull response: {json_str}"
                        raise Exception(f"Failed to parse JSON from response after repair attempts. {error_msg}")
                else:
                    raise Exception(f"Could not find JSON object in response: {json_str[:500]}")
        
        # Ensure data is a dict, not a list
        if isinstance(data, list):
            if len(data) > 0:
                data = data[0]
            else:
                raise Exception("Response is an empty list")
        
        if not isinstance(data, dict):
            raise Exception(f"Expected dict but got {type(data)}: {str(data)[:200]}")
        
        # Ensure URL is set
        data['circularLink'] = url
        
        # Validate and clean the data before creating Pydantic model
        # Handle nested structures that might be None or missing
        
        # Ensure applicationPeriod exists and is a dict
        if 'applicationPeriod' not in data or not isinstance(data.get('applicationPeriod'), dict):
            data['applicationPeriod'] = {'start': None, 'end': None}
        else:
            # Ensure nested fields exist
            if 'start' not in data['applicationPeriod']:
                data['applicationPeriod']['start'] = None
            if 'end' not in data['applicationPeriod']:
                data['applicationPeriod']['end'] = None
        
        # Ensure generalGpaRequirements exists and is a dict
        if 'generalGpaRequirements' not in data or not isinstance(data.get('generalGpaRequirements'), dict):
            data['generalGpaRequirements'] = {'ssc': None, 'hsc': None, 'total': None, 'with4thSubject': None}
        else:
            # Ensure all fields exist
            gpa_req = data['generalGpaRequirements']
            if 'ssc' not in gpa_req:
                gpa_req['ssc'] = None
            if 'hsc' not in gpa_req:
                gpa_req['hsc'] = None
            if 'total' not in gpa_req:
                gpa_req['total'] = None
            if 'with4thSubject' not in gpa_req:
                gpa_req['with4thSubject'] = None
        
        # Ensure yearRequirements exists and is a dict with lists (not None)
        if 'yearRequirements' not in data or not isinstance(data.get('yearRequirements'), dict):
            data['yearRequirements'] = {'sscYears': [], 'hscYears': []}
        else:
            # Ensure sscYears and hscYears are lists, not None
            year_req = data['yearRequirements']
            if 'sscYears' not in year_req or year_req.get('sscYears') is None:
                year_req['sscYears'] = []
            elif not isinstance(year_req['sscYears'], list):
                year_req['sscYears'] = []
            
            if 'hscYears' not in year_req or year_req.get('hscYears') is None:
                year_req['hscYears'] = []
            elif not isinstance(year_req['hscYears'], list):
                year_req['hscYears'] = []
        
        # Ensure departmentWiseRequirements is a list
        if 'departmentWiseRequirements' not in data or not isinstance(data.get('departmentWiseRequirements'), list):
            data['departmentWiseRequirements'] = []
        else:
            # Clean each department requirement
            for dept in data['departmentWiseRequirements']:
                if not isinstance(dept, dict):
                    continue
                # Ensure requiredSubjects is a list, not None
                if 'requiredSubjects' not in dept or dept.get('requiredSubjects') is None:
                    dept['requiredSubjects'] = []
                elif not isinstance(dept['requiredSubjects'], list):
                    dept['requiredSubjects'] = []
                # Ensure admissionTestSubjects is a list, not None
                if 'admissionTestSubjects' not in dept or dept.get('admissionTestSubjects') is None:
                    dept['admissionTestSubjects'] = []
                elif not isinstance(dept['admissionTestSubjects'], list):
                    dept['admissionTestSubjects'] = []
        
        # Ensure requiredDocuments is a list, not None
        if 'requiredDocuments' not in data or data.get('requiredDocuments') is None:
            data['requiredDocuments'] = []
        elif not isinstance(data['requiredDocuments'], list):
            data['requiredDocuments'] = []
        
        return AdmissionCircularData(**data), raw_response
    
    else:
        # CASE 1: URL Analysis (URL provided and failed/skipped direct download)
        prompt = f"""
        Task: Extract University Admission Requirements into JSON.
        
        User Input URL: {url}

        CRITICAL INSTRUCTIONS:
        1. The input is a URL. We attempted to download it but failed (likely due to access restrictions), so you cannot read the file directly.
        2. INSTEAD:
           a) Infer the UNIVERSITY NAME from the URL (e.g., 'ru.ac.bd' -> Rajshahi University, 'du.ac.bd' -> Dhaka University, 'cou.ac.bd' -> Comilla University).
           b) Use your knowledge about Bangladesh university admission requirements to provide typical/expected admission criteria for this university.
           c) If you know specific information about this university's admission requirements (especially for 2024-25 session), include it.
           d) If specific information is not available, provide reasonable estimates based on the university type and typical admission standards.
           e) Fill the JSON with as much accurate information as possible based on your training data.
        
        LANGUAGE HANDLING:
        - Content may be in **Bangla** or **English**.
        - **Convert ALL Bangla numerals (০,১,২...) to English numbers (0,1,2...)** for GPA and Year fields.
        - You can output string fields (like 'departmentName' or 'rawSummary') in English or Bangla (whichever is found), but English is preferred for keys/structure.

        OUTPUT FORMAT:
        Return ONLY a valid JSON object matching this schema. Include ALL available information. Do not include markdown formatting like ```json.
        
        {{
            "universityName": "string",
            "circularLink": "string (The input URL)",
            "websiteId": "string (Official website domain, e.g. admission.eis.du.ac.bd)",
            "applicationPeriod": {{ "start": "string", "end": "string" }},
            "examDate": "string",
            "examTime": "string (if mentioned)",
            "examVenue": "string (exam location/venue if mentioned)",
            "examDuration": "string (exam duration if mentioned)",
            "generalGpaRequirements": {{ "ssc": number, "hsc": number, "total": number, "with4thSubject": boolean }},
            "yearRequirements": {{ "sscYears": ["string"], "hscYears": ["string"] }},
            "departmentWiseRequirements": [
               {{ 
                 "departmentName": "string",
                 "departmentCode": "string (if available)",
                 "minGpaSSC": number, 
                 "minGpaHSC": number, 
                 "minGpaTotal": number, 
                 "requiredSubjects": ["string"], 
                 "specialConditions": "string",
                 "seatsTotal": number (if mentioned),
                 "seatsQuotaFreedomFighter": number (if mentioned),
                 "seatsQuotaTribal": number (if mentioned),
                 "seatsQuotaOther": number (if mentioned),
                 "admissionTestSubjects": ["string"] (subjects tested for this department),
                 "admissionTestFormat": "string" (MCQ, Written, etc.)
               }}
            ],
            "applicationFee": "string",
            "rawSummary": "string (Summarize key info in 2-3 sentences)",
            "ageLimitMin": number (minimum age if mentioned),
            "ageLimitMax": number (maximum age if mentioned),
            "nationalityRequirement": "string (if specified)",
            "genderRequirement": "string (if specified)",
            "contactEmail": "string (if available)",
            "contactPhone": "string (if available)",
            "contactAddress": "string (if available)",
            "requiredDocuments": ["string"] (list of required documents),
            "quotaFreedomFighter": number (total freedom fighter quota seats if mentioned),
            "quotaTribal": number (total tribal quota seats if mentioned),
            "quotaOther": "string (other quota information)",
            "additionalNotes": "string (any other important notes)"
        }}

        * Use null for missing numeric values.
        * Ensure all numbers are actual JavaScript numbers, not strings.
        """
        
        # Use model for URL-based analysis
        from google.generativeai.types import HarmCategory, HarmBlockThreshold
        
        response = model.generate_content(
            prompt,
            generation_config={
                'response_mime_type': 'application/json',
            },
            safety_settings={
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
        )
        
        # Handle response - extract text from various response formats
        response_text = None
        
        # Try different ways to get the response text
        if hasattr(response, 'text') and response.text:
            response_text = response.text
        elif hasattr(response, 'parts') and response.parts:
            for part in response.parts:
                if hasattr(part, 'text') and part.text:
                    response_text = part.text
                    break
        elif hasattr(response, 'candidates') and response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if hasattr(candidate, 'content'):
                if hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'text') and part.text:
                            response_text = part.text
                            break
                elif hasattr(candidate.content, 'text'):
                    response_text = candidate.content.text
        
        if not response_text:
            raise Exception("No response from AI")
        
        raw_response = response_text
        
        # Clean and parse JSON response (same logic as file processing)
        json_str = response_text.strip()
        
        # Remove markdown code blocks if present
        if json_str.startswith('```'):
            json_str = re.sub(r'^```(?:json)?\s*', '', json_str, flags=re.MULTILINE)
            json_str = re.sub(r'\s*```\s*$', '', json_str, flags=re.MULTILINE)
            json_str = json_str.strip()
        
        # Try to extract JSON object from text
        json_match = re.search(r'\{[\s\S]*\}', json_str)
        if json_match:
            json_str = json_match.group(0)
        
        # Parse JSON with better error handling and repair (same as file processing)
        def repair_json(json_string):
            """Try to repair common JSON issues from OCR"""
            # Remove trailing commas before closing brackets/braces
            json_string = re.sub(r',(\s*[}\]])', r'\1', json_string)
            # Remove duplicate commas
            json_string = re.sub(r'([,{[])\s*,', r'\1', json_string)
            # Fix unclosed strings (try to close them)
            json_string = re.sub(r':\s*"([^"]*?)(?:\n|$)', r': "\1"', json_string)
            # Fix single quotes to double quotes (but be careful with apostrophes)
            json_string = re.sub(r"'([^']*?)':", r'"\1":', json_string)
            json_string = re.sub(r":\s*'([^']*?)'", r': "\1"', json_string)
            return json_string
        
        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            # Try to repair JSON
            repaired_json = repair_json(json_str)
            try:
                data = json.loads(repaired_json)
            except json.JSONDecodeError:
                # Try one more time with more aggressive repair
                json_match = re.search(r'\{[\s\S]{0,50000}\}', json_str)  # Limit to 50k chars
                if json_match:
                    try:
                        data = json.loads(json_match.group(0))
                    except json.JSONDecodeError:
                        error_msg = f"JSON parse error at position {e.pos}: {str(e)}"
                        if len(json_str) > 1000:
                            error_msg += f"\nFirst 1000 chars: {json_str[:1000]}"
                        else:
                            error_msg += f"\nFull response: {json_str}"
                        raise Exception(f"Failed to parse JSON from response after repair attempts. {error_msg}")
                else:
                    raise Exception(f"Could not find JSON object in response: {json_str[:500]}")
        
        # Ensure data is a dict, not a list
        if isinstance(data, list):
            if len(data) > 0:
                data = data[0]
            else:
                raise Exception("Response is an empty list")
        
        if not isinstance(data, dict):
            raise Exception(f"Expected dict but got {type(data)}: {str(data)[:200]}")
        
        # Ensure URL is set
        data['circularLink'] = url
        
        # Validate and clean the data before creating Pydantic model
        # Handle nested structures that might be None or missing (same as file processing)
        
        # Ensure applicationPeriod exists and is a dict
        if 'applicationPeriod' not in data or not isinstance(data.get('applicationPeriod'), dict):
            data['applicationPeriod'] = {'start': None, 'end': None}
        else:
            if 'start' not in data['applicationPeriod']:
                data['applicationPeriod']['start'] = None
            if 'end' not in data['applicationPeriod']:
                data['applicationPeriod']['end'] = None
        
        # Ensure generalGpaRequirements exists and is a dict
        if 'generalGpaRequirements' not in data or not isinstance(data.get('generalGpaRequirements'), dict):
            data['generalGpaRequirements'] = {'ssc': None, 'hsc': None, 'total': None, 'with4thSubject': None}
        else:
            gpa_req = data['generalGpaRequirements']
            if 'ssc' not in gpa_req:
                gpa_req['ssc'] = None
            if 'hsc' not in gpa_req:
                gpa_req['hsc'] = None
            if 'total' not in gpa_req:
                gpa_req['total'] = None
            if 'with4thSubject' not in gpa_req:
                gpa_req['with4thSubject'] = None
        
        # Ensure yearRequirements exists and is a dict with lists (not None)
        if 'yearRequirements' not in data or not isinstance(data.get('yearRequirements'), dict):
            data['yearRequirements'] = {'sscYears': [], 'hscYears': []}
        else:
            year_req = data['yearRequirements']
            if 'sscYears' not in year_req or year_req.get('sscYears') is None:
                year_req['sscYears'] = []
            elif not isinstance(year_req['sscYears'], list):
                year_req['sscYears'] = []
            
            if 'hscYears' not in year_req or year_req.get('hscYears') is None:
                year_req['hscYears'] = []
            elif not isinstance(year_req['hscYears'], list):
                year_req['hscYears'] = []
        
        # Ensure departmentWiseRequirements is a list
        if 'departmentWiseRequirements' not in data or not isinstance(data.get('departmentWiseRequirements'), list):
            data['departmentWiseRequirements'] = []
        else:
            # Clean each department requirement
            for dept in data['departmentWiseRequirements']:
                if not isinstance(dept, dict):
                    continue
                if 'requiredSubjects' not in dept or dept.get('requiredSubjects') is None:
                    dept['requiredSubjects'] = []
                elif not isinstance(dept['requiredSubjects'], list):
                    dept['requiredSubjects'] = []
                if 'admissionTestSubjects' not in dept or dept.get('admissionTestSubjects') is None:
                    dept['admissionTestSubjects'] = []
                elif not isinstance(dept['admissionTestSubjects'], list):
                    dept['admissionTestSubjects'] = []
        
        # Ensure requiredDocuments is a list, not None
        if 'requiredDocuments' not in data or data.get('requiredDocuments') is None:
            data['requiredDocuments'] = []
        elif not isinstance(data['requiredDocuments'], list):
            data['requiredDocuments'] = []
        
        return AdmissionCircularData(**data), raw_response

