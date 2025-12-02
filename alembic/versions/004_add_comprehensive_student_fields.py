"""add comprehensive student fields

Revision ID: 004_comprehensive_student
Revises: 003_add_more_fields
Create Date: 2025-01-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_comprehensive_student'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # Add new academic fields
    op.add_column('students', sa.Column('applied_faculty', sa.String(), nullable=True))
    op.add_column('students', sa.Column('applied_program', sa.String(), nullable=True))
    
    # Add new personal information fields
    op.add_column('students', sa.Column('candidate_name', sa.String(), nullable=True))
    op.add_column('students', sa.Column('father_name', sa.String(), nullable=True))
    op.add_column('students', sa.Column('mother_name', sa.String(), nullable=True))
    op.add_column('students', sa.Column('religion', sa.String(), nullable=True))
    op.add_column('students', sa.Column('nid_or_birth_certificate', sa.String(), nullable=True))
    
    # Add contact information fields
    op.add_column('students', sa.Column('mobile_number', sa.String(), nullable=True))
    
    # Add present address fields
    op.add_column('students', sa.Column('present_division', sa.String(), nullable=True))
    op.add_column('students', sa.Column('present_district', sa.String(), nullable=True))
    op.add_column('students', sa.Column('present_thana', sa.String(), nullable=True))
    op.add_column('students', sa.Column('present_post_office', sa.String(), nullable=True))
    op.add_column('students', sa.Column('present_village', sa.String(), nullable=True))
    op.add_column('students', sa.Column('present_zip_code', sa.String(), nullable=True))
    
    # Add permanent address fields
    op.add_column('students', sa.Column('same_as_present_address', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('students', sa.Column('permanent_division', sa.String(), nullable=True))
    op.add_column('students', sa.Column('permanent_district', sa.String(), nullable=True))
    op.add_column('students', sa.Column('permanent_thana', sa.String(), nullable=True))
    op.add_column('students', sa.Column('permanent_post_office', sa.String(), nullable=True))
    op.add_column('students', sa.Column('permanent_village', sa.String(), nullable=True))
    op.add_column('students', sa.Column('permanent_zip_code', sa.String(), nullable=True))


def downgrade():
    # Remove permanent address fields
    op.drop_column('students', 'permanent_zip_code')
    op.drop_column('students', 'permanent_village')
    op.drop_column('students', 'permanent_post_office')
    op.drop_column('students', 'permanent_thana')
    op.drop_column('students', 'permanent_district')
    op.drop_column('students', 'permanent_division')
    op.drop_column('students', 'same_as_present_address')
    
    # Remove present address fields
    op.drop_column('students', 'present_zip_code')
    op.drop_column('students', 'present_village')
    op.drop_column('students', 'present_post_office')
    op.drop_column('students', 'present_thana')
    op.drop_column('students', 'present_district')
    op.drop_column('students', 'present_division')
    
    # Remove contact information fields
    op.drop_column('students', 'mobile_number')
    
    # Remove personal information fields
    op.drop_column('students', 'nid_or_birth_certificate')
    op.drop_column('students', 'religion')
    op.drop_column('students', 'mother_name')
    op.drop_column('students', 'father_name')
    op.drop_column('students', 'candidate_name')
    
    # Remove academic fields
    op.drop_column('students', 'applied_program')
    op.drop_column('students', 'applied_faculty')

