from django.core.management.base import BaseCommand, CommandError

from django.core.management import call_command
from api.models import Friends, User, Status, Rewards

import pytz
from faker import Faker
from random import choice, randint
from api.models.motivational_message import MotivationalMessage

'''
For a default users we can simply create a json file and upload the data (have a look on tests/fixtures) 
This data can be accessed and used for tests and seeder, which helps to avoid rewriting same code
If we have to use a faker, than simply add function and call in handle function after call_command()
'''

class Command(BaseCommand):

    FRIENDS_COUNT = 10
    USER_COUNT = 300
    REWARDS_COUNT = 100
    DEFAULT_PASSWORD = "Password123"
    
    def __init__(self):
        super().__init__()
        self.faker = Faker('en_GB')

    def handle(self, *args, **kwargs):
        print("Starting database seeding...")

        try:
            call_command('loaddata', 'api/tests/fixtures/default_user.json')
            call_command('loaddata', 'api/tests/fixtures/default_friends.json')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error while seeding database: {e}'))

        self.generating_users()
        self.generate_random_friends()
        self. generating_rewards()
        print("Database seeded successfully!")
        
        self.seed_motivationalMessage()

    def generate_random_friends(self):
        friends_count = Friends.objects.count()
        while friends_count < self.FRIENDS_COUNT:
            print(f"Seeding friend {friends_count}/{self.FRIENDS_COUNT}", end='\r')

            self.generate_friends()
            friends_count = Friends.objects.count()
        print("Friends seeding complete.")

    def generate_friends(self):
        users = User.objects.all()
        statuses = [c[0] for c in Status.choices]
        created_at = "2025-02-01T12:00:00Z"

        user1 = choice(users)
        user2 = choice(users)
        status = choice(statuses)

        if not user1 == user2 and not Friends.are_friends(user1, user2):
            self.create_friends({
                'user1': user1,
                'user2': user2,
                'status': status,
                'created_at': created_at
            })
    
    def create_friends(self, data):
        try:
            friends = Friends.objects.create(
                user1=data["user1"],
                user2=data["user2"],
                status=data["status"],
                created_at=data["created_at"]
            )
            return friends
        except:
            pass

    def generating_users(self):
        for x in range(self.USER_COUNT):
            print(f"Seeding user {x+1}/{self.USER_COUNT}", end='\r')
            self.generate_random_user()

    def try_create_user(self, data):
        try:
            self.create_user(data)
        except Exception as e:
            print(f"Failed to create user: {e}")

    def create_user(self, data):
        User.objects.create_user(firstname = data['firstName'], lastname = data['lastName'], email = data['email'], username = data['username'], password = self.DEFAULT_PASSWORD, hours_studied = data['hoursStudied'], streaks = data['streak'])

    def generate_random_user(self):
        firstName = self.faker.first_name()
        lastName = self.faker.last_name()
        email = self.create_email(firstName, lastName)
        username = self.create_username(firstName, lastName)
        hoursStudied = randint(0, 8760)     # assuming that the hoursStudied reset every year
        streak = randint(0, 365)            # assuming the streaks reset every year

        self.try_create_user({'firstName': firstName, 'lastName' : lastName, 'email': email, 'username': username, 'hoursStudied': hoursStudied, 'streak': streak})

    def generating_rewards(self):
        for x in range(self.REWARDS_COUNT):
            print(f"Seeding user {x+1}/{self.REWARDS_COUNT}", end='\r')
            self.generate_random_reward()

    def generate_random_reward(self):
        user = choice(User.objects.all())
        reward_id = randint(1,100)      # would be linked to firebase but for now is random numbers
        try:
            Rewards.objects.create(user = user, reward_number = reward_id)
        except Exception as e:
            print(f"Failed to create reward: {e}")

    # Helper functions
    def create_username(self, first_name, last_name):
        return '@' + first_name.lower() + last_name.lower()


    def create_email(self, first_name, last_name):
        return first_name.lower() + '.' + last_name.lower() + '@example.org'
    
    def seed_motivationalMessage(self):
        messages = [
            "Believe in yourself and all that you are.",
            "Hard work beats talent when talent doesn’t work hard.",
            "You are capable of more than you know.",
            "Success is not final, failure is not fatal: It is the courage to continue that counts.",
            "Don't watch the clock; do what it does. Keep going.",
            "Difficulties in life are intended to make us better, not bitter.",
            "You don’t have to be great to start, but you have to start to be great.",
        ]

        for msg in messages:
            MotivationalMessage.objects.get_or_create(text=msg)

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(messages)} motivational messages.'))

