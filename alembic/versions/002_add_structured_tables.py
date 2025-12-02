"""Add structured tables for admission circulars

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_tables = inspector.get_table_names()
    existing_columns = {}
    if 'analysis_results' in existing_tables:
        existing_columns = {col['name']: col for col in inspector.get_columns('analysis_results')}
    
    # Create admission_circulars table if it doesn't exist
    if 'admission_circulars' not in existing_tables:
        op.create_table(
            'admission_circulars',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('result_id', postgresql.UUID(as_uuid=True), nullable=False, unique=True),
            sa.Column('university_name', sa.String(), nullable=False),
            sa.Column('circular_link', sa.String(), nullable=False),
            sa.Column('website_id', sa.String(), nullable=False),
            sa.Column('application_period_start', sa.String(), nullable=True),
            sa.Column('application_period_end', sa.String(), nullable=True),
            sa.Column('exam_date', sa.String(), nullable=True),
            sa.Column('general_gpa_ssc', sa.Float(), nullable=True),
            sa.Column('general_gpa_hsc', sa.Float(), nullable=True),
            sa.Column('general_gpa_total', sa.Float(), nullable=True),
            sa.Column('general_gpa_with_4th_subject', sa.Boolean(), nullable=True),
            sa.Column('ssc_years', postgresql.ARRAY(sa.String()), nullable=False),
            sa.Column('hsc_years', postgresql.ARRAY(sa.String()), nullable=False),
            sa.Column('application_fee', sa.String(), nullable=True),
            sa.Column('raw_summary', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['result_id'], ['analysis_results.id'], ),
        )
    
    # Create department_requirements table if it doesn't exist
    if 'department_requirements' not in existing_tables:
        op.create_table(
            'department_requirements',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('circular_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('department_name', sa.String(), nullable=False),
            sa.Column('min_gpa_ssc', sa.Float(), nullable=True),
            sa.Column('min_gpa_hsc', sa.Float(), nullable=True),
            sa.Column('min_gpa_total', sa.Float(), nullable=True),
            sa.Column('required_subjects', postgresql.ARRAY(sa.String()), nullable=True),
            sa.Column('special_conditions', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['circular_id'], ['admission_circulars.id'], ),
        )
    
    # Remove the old JSON data column from analysis_results if it exists
    if 'data' in existing_columns:
        op.drop_column('analysis_results', 'data')


def downgrade() -> None:
    # Add back the data column
    op.add_column('analysis_results', sa.Column('data', postgresql.JSON(), nullable=True))
    
    # Drop the structured tables
    op.drop_table('department_requirements')
    op.drop_table('admission_circulars')

