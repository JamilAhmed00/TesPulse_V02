"""
Education Board Result Fetching Service

Fetches student results from http://www.educationboardresults.gov.bd/
and extracts GPA only. Student name, father's name, and mother's name are not extracted (manual entry only).
"""
import httpx
import re
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup


EDUCATION_BOARD_URL = "http://www.educationboardresults.gov.bd/"

# Board name mapping - map common names to website format
BOARD_NAME_MAPPING = {
    'chittagong': 'CHITTAGRAM',
    'dhaka': 'DHAKA',
    'rajshahi': 'RAJSHAHI',
    'comilla': 'COMILLA',
    'jessore': 'JESSORE',
    'barisal': 'BARISAL',
    'sylhet': 'SYLHET',
    'dinajpur': 'DINAJPUR',
    'mymensingh': 'MYMENSINGH',
    'madrasah': 'MADRASAH',
    'technical': 'TECHNICAL',
    'dibs (dhaka)': 'DIBS (DHAKA)',
}


def solve_captcha(captcha_text: str) -> Optional[int]:
    """
    Solve simple math CAPTCHA (e.g., "8 + 9", "5 + 4 = ").
    Returns the solution or None if unable to solve.
    """
    try:
        # Clean the text - remove "=" and extra whitespace
        captcha_text = captcha_text.strip().replace("=", "").strip()
        
        # Try to match patterns like "8 + 9", "5 + 4", "10 - 3", etc.
        # Addition (most common)
        match = re.search(r'(\d+)\s*\+\s*(\d+)', captcha_text)
        if match:
            return int(match.group(1)) + int(match.group(2))
        
        # Subtraction
        match = re.search(r'(\d+)\s*-\s*(\d+)', captcha_text)
        if match:
            return int(match.group(1)) - int(match.group(2))
        
        # Multiplication
        match = re.search(r'(\d+)\s*\*\s*(\d+)', captcha_text)
        if match:
            return int(match.group(1)) * int(match.group(2))
        
        # Division (less common but possible)
        match = re.search(r'(\d+)\s*/\s*(\d+)', captcha_text)
        if match:
            divisor = int(match.group(2))
            if divisor != 0:
                return int(match.group(1)) // divisor
        
        return None
    except Exception as e:
        import logging
        logging.error(f"Error solving CAPTCHA '{captcha_text}': {str(e)}")
        return None


def extract_captcha_from_html(html: str) -> Optional[str]:
    """
    Extract CAPTCHA text from HTML.
    Based on actual Education Board website structure.
    """
    try:
        soup = BeautifulSoup(html, 'lxml')
        
        # Method 1: Look for CAPTCHA input field (name="value_s") and find the label before it
        captcha_input = soup.find('input', {'name': 'value_s'})
        if captcha_input:
            # Find the parent row (tr)
            parent_row = captcha_input.find_parent('tr')
            if parent_row:
                # Look for the td before the input that contains the CAPTCHA text
                tds = parent_row.find_all('td')
                for td in tds:
                    td_text = td.get_text().strip()
                    # Match pattern like "8 + 9" or "5 + 4"
                    if re.search(r'^\d+\s*[+\-*]\s*\d+$', td_text):
                        return td_text
        
        # Method 2: Look for pattern in table cells (the CAPTCHA is in a td before the input)
        all_tds = soup.find_all('td')
        for td in all_tds:
            td_text = td.get_text().strip()
            # Match patterns like "8 + 9", "5 + 4", "10 - 3", etc.
            if re.search(r'^\d+\s*[+\-*]\s*\d+$', td_text):
                # Check if next sibling or nearby is the value_s input
                next_sibling = td.find_next_sibling('td')
                if next_sibling:
                    input_in_next = next_sibling.find('input', {'name': 'value_s'})
                    if input_in_next:
                        return td_text
        
        # Method 3: Look for CAPTCHA text near "value_s" input
        value_s_input = soup.find('input', {'name': re.compile(r'value', re.I)})
        if value_s_input:
            # Look in the same row
            parent_row = value_s_input.find_parent('tr')
            if parent_row:
                row_text = parent_row.get_text()
                captcha_match = re.search(r'(\d+\s*[+\-*]\s*\d+)', row_text)
                if captcha_match:
                    return captcha_match.group(1)
        
        # Method 4: General search in all text
        all_text = soup.find_all(string=True)
        for text in all_text:
            text_str = str(text).strip()
            if re.search(r'^\d+\s*[+\-*]\s*\d+$', text_str):
                return text_str
        
        return None
    except Exception as e:
        import logging
        logging.error(f"Error extracting CAPTCHA: {str(e)}")
        return None


def parse_result_page(html: str) -> Dict[str, Optional[str]]:
    """
    Parse the Education Board result page HTML to extract:
    - GPA only
    
    Note: Student name, Father's name, and Mother's name are not extracted (manual entry only)
    """
    result = {
        'gpa': None,
        'father_name': None,  # Not extracted - manual entry only
        'mother_name': None,  # Not extracted - manual entry only
        'student_name': None,  # Not extracted - manual entry only
    }
    
    try:
        soup = BeautifulSoup(html, 'lxml')
        
        # Method 1: Extract from tables (most reliable)
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                
                # Handle 2-column format (label: value)
                if len(cells) >= 2:
                    label_text = cells[0].get_text().strip()
                    value_text = cells[1].get_text().strip()
                    label_lower = label_text.lower()
                    
                    # GPA extraction
                    if not result['gpa']:
                        if any(keyword in label_lower for keyword in ['gpa', 'grade point', 'point average', 'grade']):
                            # Extract numeric GPA value
                            gpa_match = re.search(r'(\d+\.?\d*)', value_text)
                            if gpa_match:
                                try:
                                    gpa_val = float(gpa_match.group(1))
                                    if 0 <= gpa_val <= 5.0:
                                        result['gpa'] = gpa_match.group(1)
                                except ValueError:
                                    pass
                        # Also check if value itself is a GPA
                        elif re.search(r'^(\d+\.\d{2})$', value_text.strip()):
                            try:
                                gpa_val = float(value_text.strip())
                                if 0 <= gpa_val <= 5.0:
                                    result['gpa'] = value_text.strip()
                            except ValueError:
                                pass
                    
                    # Father's name extraction - DISABLED (manual entry only)
                    # Not extracting father's name from board results
                    
                    # Mother's name extraction - DISABLED (manual entry only)
                    # Not extracting mother's name from board results
                    
                    # Student name extraction - DISABLED (manual entry only)
                    # Not extracting student name from board results
                
                # Handle single row with multiple cells (all data in one row)
                elif len(cells) > 2:
                    cell_texts = [cell.get_text().strip() for cell in cells]
                    for i, cell_text in enumerate(cell_texts):
                        # Look for GPA
                        if not result['gpa']:
                            gpa_match = re.search(r'(\d+\.\d{2})', cell_text)
                            if gpa_match:
                                try:
                                    gpa_val = float(gpa_match.group(1))
                                    if 0 <= gpa_val <= 5.0:
                                        result['gpa'] = gpa_match.group(1)
                                except ValueError:
                                    pass
                        
                        # Name extraction disabled (manual entry only)
                        # Student, father's, and mother's names are not extracted
        
        # Method 2: Extract from divs with specific classes/ids
        if not result['gpa']:
            # Look for divs with common result page patterns
            divs = soup.find_all('div')
            for div in divs:
                div_text = div.get_text().strip()
                div_class = div.get('class', [])
                div_id = div.get('id', '')
                
                # GPA in divs
                if not result['gpa']:
                    gpa_match = re.search(r'GPA[:\s-]*(\d+\.?\d*)', div_text, re.IGNORECASE)
                    if gpa_match:
                        result['gpa'] = gpa_match.group(1)
                    elif 'gpa' in str(div_class).lower() or 'gpa' in div_id.lower():
                        gpa_val = re.search(r'(\d+\.?\d*)', div_text)
                        if gpa_val:
                            result['gpa'] = gpa_val.group(1)
                
                # Father's name in divs - DISABLED (manual entry only)
                # Mother's name in divs - DISABLED (manual entry only)
        
        # Method 3: Extract from text content using regex (fallback)
        text_content = soup.get_text()
        
        # GPA patterns
        if not result['gpa']:
            gpa_patterns = [
                r'GPA[:\s-]*(\d+\.?\d*)',
                r'Grade\s*Point\s*Average[:\s]*(\d+\.?\d*)',
                r'(\d+\.\d{2})\s*(?:GPA|Grade)',
                r'GPA\s*=\s*(\d+\.?\d*)',
            ]
            for pattern in gpa_patterns:
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    gpa_val = match.group(1)
                    # Validate GPA is in reasonable range
                    try:
                        if 0 <= float(gpa_val) <= 5.0:
                            result['gpa'] = gpa_val
                            break
                    except ValueError:
                        continue
        
        # Father's name patterns - DISABLED (manual entry only)
        # Mother's name patterns - DISABLED (manual entry only)
        
        # Student name patterns - DISABLED (manual entry only)
        
        # Method 4: Look for result in specific result containers
        result_containers = soup.find_all(['div', 'span'], class_=re.compile(r'result|info|detail', re.I))
        for container in result_containers:
            container_text = container.get_text()
            
            # Try to extract structured data from result containers
            if not result['gpa']:
                gpa_match = re.search(r'(\d+\.\d{2})', container_text)
                if gpa_match:
                    gpa_val = gpa_match.group(1)
                    try:
                        if 0 <= float(gpa_val) <= 5.0:
                            result['gpa'] = gpa_val
                    except ValueError:
                        pass
        
    except Exception as e:
        # Log error for debugging but return partial results
        import logging
        logging.error(f"Error parsing result page: {str(e)}")
    
    return result


async def fetch_education_board_result(
    examination: str,
    year: str,
    board: str,
    roll: str,
    registration: str
) -> Dict[str, Any]:
    """
    Fetch result from Education Board website.
    
    Args:
        examination: "SSC" or "HSC"
        year: Year of examination
        board: Board name (e.g., "Dhaka", "Chittagong")
        roll: Roll number
        registration: Registration number
    
    Returns:
        Dictionary with success status, extracted data, and error message if any
    """
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            # First, get the form page to extract CAPTCHA
            response = await client.get(EDUCATION_BOARD_URL)
            if response.status_code != 200:
                return {
                    'success': False,
                    'gpa': None,
                    'father_name': None,
                    'mother_name': None,
                    'student_name': None,
                    'error': f'Failed to load Education Board website: {response.status_code}'
                }
            
            html = response.text
            soup = BeautifulSoup(html, 'lxml')
            
            # Extract CAPTCHA
            captcha_text = extract_captcha_from_html(html)
            captcha_solution = None
            if captcha_text:
                captcha_solution = solve_captcha(captcha_text)
            
            # Find the form
            form = soup.find('form')
            if not form:
                return {
                    'success': False,
                    'gpa': None,
                    'father_name': None,
                    'mother_name': None,
                    'student_name': None,
                    'error': 'Could not find form on Education Board website'
                }
            
            # Prepare form data - start with all hidden fields
            form_data = {}
            
            # First, collect all hidden fields (sr, et, etc.)
            hidden_inputs = form.find_all('input', type='hidden')
            for hidden in hidden_inputs:
                name = hidden.get('name')
                if name:
                    form_data[name] = hidden.get('value', '')
            
            # Handle select dropdowns first
            exam_select = form.find('select', {'name': 'exam'})
            if exam_select:
                # Map examination type to form value
                exam_value_map = {
                    'SSC': 'ssc',
                    'HSC': 'hsc',
                    'JSC': 'jsc',
                }
                exam_value = exam_value_map.get(examination.upper(), examination.lower())
                form_data['exam'] = exam_value
            
            year_select = form.find('select', {'name': 'year'})
            if year_select:
                form_data['year'] = year
            
            board_select = form.find('select', {'name': 'board'})
            if board_select:
                # Map board name to form value (lowercase)
                board_lower = board.lower()
                board_value_map = {
                    'chittagong': 'chittagong',
                    'dhaka': 'dhaka',
                    'rajshahi': 'rajshahi',
                    'comilla': 'comilla',
                    'jessore': 'jessore',
                    'barisal': 'barisal',
                    'sylhet': 'sylhet',
                    'dinajpur': 'dinajpur',
                    'mymensingh': 'mymensingh',
                    'madrasah': 'madrasah',
                    'technical': 'tec',
                    'dibs (dhaka)': 'dibs',
                }
                form_data['board'] = board_value_map.get(board_lower, board_lower)
            
            # Handle text inputs
            roll_input = form.find('input', {'name': 'roll'})
            if roll_input:
                form_data['roll'] = roll
            
            reg_input = form.find('input', {'name': 'reg'})
            if reg_input:
                form_data['reg'] = registration
            
            # Handle CAPTCHA (value_s field)
            value_s_input = form.find('input', {'name': 'value_s'})
            if value_s_input:
                if captcha_solution is None:
                    return {
                        'success': False,
                        'gpa': None,
                        'father_name': None,
                        'mother_name': None,
                        'student_name': None,
                        'error': 'Could not solve CAPTCHA. Please try again.'
                    }
                form_data['value_s'] = str(captcha_solution)
            
            # Validate all required fields are present
            required_fields = ['exam', 'year', 'board', 'roll', 'reg', 'value_s']
            missing_fields = [field for field in required_fields if field not in form_data or not form_data[field]]
            if missing_fields:
                return {
                    'success': False,
                    'gpa': None,
                    'father_name': None,
                    'mother_name': None,
                    'student_name': None,
                    'error': f'Missing required form fields: {", ".join(missing_fields)}'
                }
            
            # Get form action URL (from the HTML: action="result.php")
            form_action = form.get('action', 'result.php')
            if form_action.startswith('/'):
                submit_url = EDUCATION_BOARD_URL.rstrip('/') + form_action
            elif form_action.startswith('http'):
                submit_url = form_action
            else:
                submit_url = EDUCATION_BOARD_URL.rstrip('/') + '/' + form_action.lstrip('/')
            
            # Debug: Print form data
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Form data to submit: {form_data}")
            logger.info(f"CAPTCHA text: {captcha_text}, Solution: {captcha_solution}")
            
            # Submit the form
            submit_response = await client.post(
                submit_url, 
                data=form_data, 
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': EDUCATION_BOARD_URL,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                follow_redirects=True
            )
            
            if submit_response.status_code != 200:
                return {
                    'success': False,
                    'gpa': None,
                    'father_name': None,
                    'mother_name': None,
                    'student_name': None,
                    'error': f'Failed to submit form: {submit_response.status_code}'
                }
            
            # Parse the result page
            result_html = submit_response.text
            
            # Debug: Check response
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Response status: {submit_response.status_code}, Length: {len(result_html)}")
            logger.info(f"Response URL: {submit_response.url}")
            # Log first 500 chars of response for debugging
            logger.info(f"Response preview: {result_html[:500]}")
            
            # Check if we got the form page back (submission failed)
            if 'name="result"' in result_html or 'name="exam"' in result_html or 'value_s' in result_html:
                # We got the form page back, which means submission likely failed
                # Check for error messages in the form page
                result_soup = BeautifulSoup(result_html, 'lxml')
                error_text = result_soup.get_text().lower()
                
                if 'invalid' in error_text or 'incorrect' in error_text or 'wrong' in error_text:
                    return {
                        'success': False,
                        'gpa': None,
                        'father_name': None,
                        'mother_name': None,
                        'student_name': None,
                        'error': 'Invalid credentials or CAPTCHA. Please verify your information.'
                    }
                else:
                    return {
                        'success': False,
                        'gpa': None,
                        'father_name': None,
                        'mother_name': None,
                        'student_name': None,
                        'error': 'Form submission failed. Please try again.'
                    }
            
            # Check if we got a result page or an error page
            if len(result_html) < 500:
                # Very short response, likely an error or redirect
                return {
                    'success': False,
                    'gpa': None,
                    'father_name': None,
                    'mother_name': None,
                    'student_name': None,
                    'error': 'Received invalid response from Education Board. Response too short.'
                }
            
            # Check for error messages in the response
            result_soup = BeautifulSoup(result_html, 'lxml')
            result_text = result_soup.get_text().lower()
            
            # Common error indicators
            error_indicators = [
                'not found', 'invalid', 'error', 'incorrect', 
                'wrong', 'does not exist', 'no result', 'result not found',
                'পাওয়া যায়নি', 'ভুল', 'ত্রুটি', 'incorrect captcha', 'wrong captcha'
            ]
            
            if any(indicator in result_text for indicator in error_indicators):
                # Extract specific error message if available
                error_msg = 'Result not found. Please verify your credentials.'
                for indicator in error_indicators:
                    if indicator in result_text:
                        # Try to extract the actual error message
                        error_match = re.search(rf'{indicator}[^.]*', result_text, re.I)
                        if error_match:
                            error_msg = error_match.group(0).strip()
                        break
                
                return {
                    'success': False,
                    'gpa': None,
                    'father_name': None,
                    'mother_name': None,
                    'student_name': None,
                    'error': error_msg
                }
            
            # Parse the result
            parsed_data = parse_result_page(result_html)
            
            # Post-processing disabled for all names (manual entry only)
            # Always set to None
            parsed_data['father_name'] = None
            parsed_data['mother_name'] = None
            parsed_data['student_name'] = None
            
            # Log parsing results
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Parsed data: GPA={parsed_data.get('gpa')}")
            
            # If no data was extracted, check if result page actually contains result data
            if not parsed_data.get('gpa'):
                # Check if page contains result indicators
                result_soup = BeautifulSoup(result_html, 'lxml')
                result_text = result_soup.get_text().lower()
                
                # If page has result-like content but we couldn't parse it
                if any(keyword in result_text for keyword in ['roll', 'registration', 'board', 'gpa', 'grade']):
                    # Try one more time with more aggressive parsing
                    # Look for any table or structured data
                    all_tables = result_soup.find_all('table')
                    if all_tables:
                        # Try to extract from first table more aggressively
                        for table in all_tables[:2]:  # Check first 2 tables
                            rows = table.find_all('tr')
                            for row in rows:
                                cells = [cell.get_text().strip() for cell in row.find_all(['td', 'th'])]
                                for i, cell_text in enumerate(cells):
                                    # Look for GPA-like values
                                    if not parsed_data['gpa']:
                                        gpa_match = re.search(r'(\d+\.\d{2})', cell_text)
                                        if gpa_match:
                                            try:
                                                gpa_val = float(gpa_match.group(1))
                                                if 0 <= gpa_val <= 5.0:
                                                    parsed_data['gpa'] = gpa_match.group(1)
                                            except ValueError:
                                                pass
                                    
                                    # Name extraction disabled (manual entry only)
                                    # All names (student, father, mother) are not extracted
            
            return {
                'success': True,
                'gpa': parsed_data.get('gpa'),
                'father_name': parsed_data.get('father_name'),
                'mother_name': parsed_data.get('mother_name'),
                'student_name': parsed_data.get('student_name'),
                'error': None
            }
            
    except httpx.TimeoutException:
        return {
            'success': False,
            'gpa': None,
            'father_name': None,
            'mother_name': None,
            'student_name': None,
            'error': 'Request timeout. Please try again.'
        }
    except Exception as e:
        return {
            'success': False,
            'gpa': None,
            'father_name': None,
            'mother_name': None,
            'student_name': None,
            'error': f'An error occurred: {str(e)}'
        }

