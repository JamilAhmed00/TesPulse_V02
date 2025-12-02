"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Check if enum types exist, create if not
    connection = op.get_bind()
    
    # Check and create jobstatus enum
    result = connection.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'jobstatus'"))
    if result.fetchone() is None:
        connection.execute(sa.text("CREATE TYPE jobstatus AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')"))
    
    # Check and create resultstatus enum
    result = connection.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'resultstatus'"))
    if result.fetchone() is None:
        connection.execute(sa.text("CREATE TYPE resultstatus AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')"))
    
    # Check if tables exist before creating
    inspector = sa.inspect(connection)
    existing_tables = inspector.get_table_names()
    
    # Create analysis_jobs table if it doesn't exist
    if 'analysis_jobs' not in existing_tables:
        op.create_table(
            'analysis_jobs',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('status', postgresql.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='jobstatus', create_type=False), nullable=False),
            sa.Column('urls', postgresql.ARRAY(sa.String()), nullable=False),
            sa.Column('urls_count', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        )
    
    # Create analysis_results table if it doesn't exist
    if 'analysis_results' not in existing_tables:
        op.create_table(
            'analysis_results',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('job_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('url', sa.String(), nullable=False),
            sa.Column('status', postgresql.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='resultstatus', create_type=False), nullable=False),
            sa.Column('data', postgresql.JSON(), nullable=True),
            sa.Column('error', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['job_id'], ['analysis_jobs.id'], ),
        )


def downgrade() -> None:
    op.drop_table('analysis_results')
    op.drop_table('analysis_jobs')
    
    # Drop enum types if they exist
    connection = op.get_bind()
    result = connection.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'jobstatus'"))
    if result.fetchone() is not None:
        connection.execute(sa.text("DROP TYPE IF EXISTS jobstatus"))
    
    result = connection.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'resultstatus'"))
    if result.fetchone() is not None:
        connection.execute(sa.text("DROP TYPE IF EXISTS resultstatus"))

