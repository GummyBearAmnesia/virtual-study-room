from django.core.management.base import BaseCommand, CommandError
from api.models import *


class Command(BaseCommand):
    """Build automation command to unseed the database."""

    help = 'Unseeds the database by removing all sample data'

    def handle(self, *args, **options):
        """Unseed the database."""
        print("Starting database unseeding...")
        # Delete in order to respect foreign key constraints
        print("Deleting Motivational Message...")
        deleted_count, _ = MotivationalMessage.objects.all().delete()
        print(self.style.SUCCESS(f'Successfully deleted {deleted_count} motivational messages.'))

        # deleted_countevent, _ = Event.objects.all().delete()

        # if deleted_countevent:
        #     self.stdout.write(self.style.SUCCESS(f'Successfully deleted {deleted_countevent} events'))
        # else:
        #     self.stdout.write(self.style.WARNING('No events found to delete'))

        # Delete in order to respect foreign key constraints

        print("Deleting To Do List Items")
        toDoList.objects.all().delete()

        print("Deleting all Permission Items")
        Permission.objects.all().delete()

        List.objects.all().delete()

        print("Deleting Session Users...")  # Add this line
        SessionUser.objects.all().delete()

        print("Deleting Study Sessions...")
        StudySession.objects.all().delete()

        print("Deleting Appointments...")
        Appointments.objects.all().delete()

    
        print("Deleting friends...")
        Friends.objects.all().delete()

        print("Deleting rewards...")
        Rewards.objects.all().delete()

        print("Deleting users...")

        User.objects.all().delete()
        
        print("Database successfully unseeded!")

