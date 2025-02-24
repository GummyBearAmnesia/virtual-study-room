from django.db import models
from django.utils.timezone import now
import datetime
from .user import User
from .study_session import StudySession
from django.db import connection

class SessionUser(models.Model):
    """
    Represents a user's participation in a study session, tracking a range of session-specific information.
    """
    # Foreign keys
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='session_users')
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='session_users')
    # Track which join this is (first join = 1, second = 2, etc.)
    join_sequence = models.PositiveIntegerField(default=1)
    # Current status in the session - determines availability and focus state
    status = models.CharField(
        max_length=20,
        choices=[
            ('FOCUSED', 'Focused'),      # Actively studying, no distractions
            ('CASUAL', 'Casual'),        # In study session but open to interaction
        ],
        default='CASUAL'
    )
    # What specific thing the user is currently working on
    focus_target = models.CharField(max_length=255, null=True, blank=True)
    # When the user joined and left the session
    joined_at = models.DateTimeField(default=now)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        # Sort by newest sessions and joins first
        ordering = ['session', 'joined_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_status_display()} - {self.session.sessionName}"

    def update_status(self, new_status):
        """
        Update user's status and track focused study time.
        If user was in FOCUSED status, adds the elapsed time
        to their total focus time before changing status.
        """
        valid_statuses = ['FOCUSED', 'CASUAL']
        if new_status not in valid_statuses:
            raise ValueError("Invalid status")
            
        current_time = now()
        
        if self.status == 'FOCUSED':
            time_diff = current_time - self.joined_at
            self.focus_time += time_diff
            
        self.status = new_status
        self.save()

    def leave_session(self):
        """
        Calculate total session time, update user's study statistics, and remove session entry.
        """
        # Calculate total session time
        if self.left_at is None:
            self.left_at = now()

        session_duration = self.left_at - self.joined_at
        hours_studied = session_duration.total_seconds() / 3600  # Convert to hours

        # Update user's total study statistics
        if hours_studied > 0:
            self.user.hours_studied += int(hours_studied)
            self.user.total_sessions += 1  # Increment total sessions
            self.user.save()

        # Delete the session user entry
        self.delete()

    def update_focus_target(self, new_goal):
        """
        Update the user's focus target for this study session. 
        """
        if not new_goal or len(new_goal) > 255:
            raise ValueError("Goal shouldn't be empty and must have 255 characters or less!")
        self.focus_target = new_goal
        self.save()

    @classmethod
    def rejoin_session(cls, user, session):
        """
        Creates a new SessionUser entry for a user rejoining a session.
        First ensures any existing session entry is properly closed out.
        Increments the join_sequence field based on previous joins.
        """
        # Close any existing active sessions
        for existing_session in cls.objects.filter(user=user, left_at__isnull=True):
            existing_session.leave_session()
        
        # Get next sequence number by counting ALL previous joins (including left sessions)
        next_sequence = cls.objects.filter(
            user=user, 
            session=session
        ).count() + 1
        
        # Create and return new session
        return cls.objects.create(
            user=user,
            session=session,
            join_sequence=next_sequence
        )

