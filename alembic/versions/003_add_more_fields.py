"""Add more fields to store additional information

Revision ID: 003
Revises: 002
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    # Get existing columns for each table
    analysis_results_columns = {}
    admission_circulars_columns = {}
    department_requirements_columns = {}
    
    if 'analysis_results' in inspector.get_table_names():
        analysis_results_columns = {col['name']: col for col in inspector.get_columns('analysis_results')}
    
    if 'admission_circulars' in inspector.get_table_names():
        admission_circulars_columns = {col['name']: col for col in inspector.get_columns('admission_circulars')}
    
    if 'department_requirements' in inspector.get_table_names():
        department_requirements_columns = {col['name']: col for col in inspector.get_columns('department_requirements')}
    
    # Add processing metadata to analysis_results (if columns don't exist)
    if 'processing_time_ms' not in analysis_results_columns:
        op.add_column('analysis_results', sa.Column('processing_time_ms', sa.Integer(), nullable=True))
    if 'file_size_bytes' not in analysis_results_columns:
        op.add_column('analysis_results', sa.Column('file_size_bytes', sa.Integer(), nullable=True))
    if 'file_mime_type' not in analysis_results_columns:
        op.add_column('analysis_results', sa.Column('file_mime_type', sa.String(), nullable=True))
    
    # Add exam details to admission_circulars (if columns don't exist)
    if 'exam_time' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('exam_time', sa.String(), nullable=True))
    if 'exam_venue' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('exam_venue', sa.String(), nullable=True))
    if 'exam_duration' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('exam_duration', sa.String(), nullable=True))
    
    # Add additional requirements (if columns don't exist)
    if 'age_limit_min' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('age_limit_min', sa.Integer(), nullable=True))
    if 'age_limit_max' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('age_limit_max', sa.Integer(), nullable=True))
    if 'nationality_requirement' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('nationality_requirement', sa.String(), nullable=True))
    if 'gender_requirement' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('gender_requirement', sa.String(), nullable=True))
    
    # Add contact information (if columns don't exist)
    if 'contact_email' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('contact_email', sa.String(), nullable=True))
    if 'contact_phone' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('contact_phone', sa.String(), nullable=True))
    if 'contact_address' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('contact_address', sa.Text(), nullable=True))
    
    # Add required documents (if column doesn't exist)
    if 'required_documents' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('required_documents', postgresql.ARRAY(sa.String()), nullable=True))
    
    # Add quota information (if columns don't exist)
    if 'quota_freedom_fighter' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('quota_freedom_fighter', sa.Integer(), nullable=True))
    if 'quota_tribal' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('quota_tribal', sa.Integer(), nullable=True))
    if 'quota_other' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('quota_other', sa.Text(), nullable=True))
    
    # Add additional notes and raw response (if columns don't exist)
    if 'additional_notes' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('additional_notes', sa.Text(), nullable=True))
    if 'raw_response' not in admission_circulars_columns:
        op.add_column('admission_circulars', sa.Column('raw_response', sa.Text(), nullable=True))
    
    # Add department-specific fields (if columns don't exist)
    if 'department_code' not in department_requirements_columns:
        op.add_column('department_requirements', sa.Column('department_code', sa.String(), nullable=True))
    if 'seats_total' not in department_requirements_columns:
        op.add_column('department_requirements', sa.Column('seats_total', sa.Integer(), nullable=True))
    if 'seats_quota_freedom_fighter' not in department_requirements_columns:
        op.add_column('department_requirements', sa.Column('seats_quota_freedom_fighter', sa.Integer(), nullable=True))
    if 'seats_quota_tribal' not in department_requirements_columns:
        op.add_column('department_requirements', sa.Column('seats_quota_tribal', sa.Integer(), nullable=True))
    if 'seats_quota_other' not in department_requirements_columns:
        op.add_column('department_requirements', sa.Column('seats_quota_other', sa.Integer(), nullable=True))
    if 'admission_test_subjects' not in department_requirements_columns:
        op.add_column('department_requirements', sa.Column('admission_test_subjects', postgresql.ARRAY(sa.String()), nullable=True))
    if 'admission_test_format' not in department_requirements_columns:
        op.add_column('department_requirements', sa.Column('admission_test_format', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove department-specific fields
    op.drop_column('department_requirements', 'admission_test_format')
    op.drop_column('department_requirements', 'admission_test_subjects')
    op.drop_column('department_requirements', 'seats_quota_other')
    op.drop_column('department_requirements', 'seats_quota_tribal')
    op.drop_column('department_requirements', 'seats_quota_freedom_fighter')
    op.drop_column('department_requirements', 'seats_total')
    op.drop_column('department_requirements', 'department_code')
    
    # Remove additional notes and raw response
    op.drop_column('admission_circulars', 'raw_response')
    op.drop_column('admission_circulars', 'additional_notes')
    
    # Remove quota information
    op.drop_column('admission_circulars', 'quota_other')
    op.drop_column('admission_circulars', 'quota_tribal')
    op.drop_column('admission_circulars', 'quota_freedom_fighter')
    
    # Remove required documents
    op.drop_column('admission_circulars', 'required_documents')
    
    # Remove contact information
    op.drop_column('admission_circulars', 'contact_address')
    op.drop_column('admission_circulars', 'contact_phone')
    op.drop_column('admission_circulars', 'contact_email')
    
    # Remove additional requirements
    op.drop_column('admission_circulars', 'gender_requirement')
    op.drop_column('admission_circulars', 'nationality_requirement')
    op.drop_column('admission_circulars', 'age_limit_max')
    op.drop_column('admission_circulars', 'age_limit_min')
    
    # Remove exam details
    op.drop_column('admission_circulars', 'exam_duration')
    op.drop_column('admission_circulars', 'exam_venue')
    op.drop_column('admission_circulars', 'exam_time')
    
    # Remove processing metadata
    op.drop_column('analysis_results', 'file_mime_type')
    op.drop_column('analysis_results', 'file_size_bytes')
    op.drop_column('analysis_results', 'processing_time_ms')

