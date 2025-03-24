import logging
logging.basicConfig(level=logging.INFO, handlers=[logging.StreamHandler()])
from django.core.management.base import BaseCommand, CommandError
from api.models.motivational_message import MotivationalMessage
import random
from django.core.management import call_command

from api.models import Friends, Appointments, User, Status, toDoList, Permission, MotivationalMessage, Rewards, StudySession, SessionUser, List


import pytz
from faker import Faker
from django.utils.timezone import now, make_aware
from random import choice, randint, sample
from datetime import datetime, timedelta, date

'''
For a default users we can simply create a json file and upload the data (have a look on tests/fixtures) 
This data can be accessed and used for tests and seeder, which helps to avoid rewriting same code
If we have to use a faker, than simply add function and call in handle function after call_command()
'''

class Command(BaseCommand):

    FRIENDS_COUNT = 10
    USER_COUNT = 30
    REWARDS_COUNT = 10
    DEFAULT_PASSWORD = "Password123"
    TODOLIST_COUNT = 10
    LIST_COUNT = 2
    SESSION_COUNT = 5
    SESSION_USER_COUNT = 25

    def __init__(self):
        super().__init__()
        self.faker = Faker('en_GB')

    def handle(self, *args, **kwargs):
        print("Starting database seeding...")

        try:
            call_command('loaddata', 'api/tests/fixtures/default_user.json')
            call_command('loaddata', 'api/tests/fixtures/default_friends.json')

            call_command('loaddata', 'api/tests/fixtures/default_lists.json')
            call_command('loaddata', 'api/tests/fixtures/default_permissions.json')
            call_command('loaddata', 'api/tests/fixtures/default_list_task.json')
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error while seeding database: {e}'))
      
        self.seed_motivationalMessage()
        self.generating_users()
        User.objects.create_user(
            email = "testuser@email.com",
            firstname = "Test",
            lastname = "User",
            username = "TestUser1",
            password = "Password123",
            description = "This is a test user"
        )
        self.generate_random_friends()
        #self.generating_rewards()
        self.generate_random_Lists()
        self.generate_random_toDoLists()
        self.generate_toDoListUsers()
        self.generate_events()
        

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
                'created_at': created_at,
                'requested_by': user1
            })

    def create_friends(self, data):
        try:
            friends = Friends.objects.create(
                user1=data["user1"],
                user2=data["user2"],
                status=data["status"],
                created_at=data["created_at"],
                requested_by=data["requested_by"]
            )
            return friends
        except:
            pass


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
        User.objects.create_user(firstname = data['firstName'], lastname = data['lastName'], email = data['email'], username = data['username'], password = self.DEFAULT_PASSWORD, hours_studied = data['hoursStudied'], streaks = data['streaks'], description = data['description'], total_sessions = data['totalSessions'])

    def generate_random_user(self):
        firstName = self.faker.first_name()
        lastName = self.faker.last_name()
        email = self.create_email(firstName, lastName)
        username = self.create_username(firstName, lastName)
        hoursStudied = randint(0, 8760)     # assuming that the hoursStudied reset every year
        streaks = randint(0, 365)            # assuming the streaks reset every year
        description = Faker().text(max_nb_chars=200)
        totalSessions = randint(1, 100)

        self.try_create_user({'firstName': firstName, 'lastName' : lastName, 'email': email, 'username': username, 'hoursStudied': hoursStudied, 'streaks': streaks, 'description': description, 'totalSessions': totalSessions})

    def generating_rewards(self):
        for x in range(self.REWARDS_COUNT):
            print(f"Seeding user {x+1}/{self.REWARDS_COUNT}", end='\r')
            self.generate_random_reward()

    def generate_random_reward(self):
        user = choice(User.objects.all())
        reward_id = randint(1,8)      # since there are 8 rewards, it will choose from one of those
        try:
            Rewards.objects.create(user = user, reward_number = reward_id)
        except Exception as e:
            print(f"Failed to create reward: {e}")

    def generate_random_toDoLists(self):
        toDoList_count = toDoList.objects.count()
        print(f"Initial ToDoList count: {toDoList_count}, Target: {self.TODOLIST_COUNT}")

        while toDoList_count < self.TODOLIST_COUNT:
            print(f"Seeding ToDoLists {toDoList_count}/{self.TODOLIST_COUNT}")
            self.generate_toDoLists()
            toDoList_count = toDoList.objects.count()
        
        print(f"Final ToDoList count: {toDoList_count}, Target: {self.TODOLIST_COUNT}")
        print("ToDoList seeding complete.")

    def generate_toDoLists(self):
        titles = ['Finish cw1', 'catch with with week 2', 'Project Task: create a database']
        contents = ['complete week 2 and week3', 'ask TA for help', 'clone github repo', 'understand travelling salesman problem', '']

        list = choice(List.objects.all())
        title = choice(titles)
        content = choice(contents)
        is_completed = choice([True, False])
        #is_shared = choice([True, False])

        self.create_toDoLists({
            'list': list,
            'title':title,
            'content':content,
            'is_completed':is_completed,
            #'is_shared': is_shared
        })

    def create_toDoLists(self, data):
        try:
            toDoLists = toDoList.objects.create(
                list = data["list"],
                title = data["title"],
                content = data["content"],
                is_completed = data["is_completed"],
                #is_shared = data["is_shared"]
            )
            return toDoLists
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating ToDoList: {str(e)}'))


    def generate_random_Lists(self):
        toDoList_count = List.objects.count()
        print(
            f"Initial List count: {toDoList_count}, Target: {self.LIST_COUNT}")

        while toDoList_count < self.LIST_COUNT:
            print(f"Seeding ToDoLists {toDoList_count}/{self.LIST_COUNT}")
            self.generate_Lists()
            toDoList_count = List.objects.count()

        print(
            f"Final List count: {toDoList_count}, Target: {self.LIST_COUNT}")
        print("List seeding complete.")
    
    def generate_Lists(self):
        titles = ['Finish cw1', 'catch with with week 2',
                  'Project Task: create a database']

        name = choice(titles)

        is_shared = choice([True, False])
        self.create_Lists({
            'name': name,
            'is_shared': is_shared
        })

    def create_Lists(self, data):
        try:
            Lists = List.objects.create(
                name=data["name"],
                is_shared=data["is_shared"]
            )
            return Lists
        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'Error creating ToDoList: {str(e)}'))


    def generate_toDoListUsers(self):
        users = list(User.objects.all())
        toDoLists = list(List.objects.all())

        print(f"Starting to seed permissions for {len(toDoLists)} toDoLists and {len(users)} users.")

        for toDo in toDoLists:
            '''if toDo.is_shared:
                num_permissions = randint(2, len(users))
            else:
                num_permissions = 1'''
            
            selected_users = sample(users, 1)

            #print(f"{'Shared' if toDo.is_shared else 'Exclusive'} toDoList {toDo.list_id}: Assigning {num_permissions} permissions.")

            for user in selected_users:
                #print(f"Assigning {permission_type} permission to user {user.user_id} for toDoList {toDo.list_id}.")

                self.create_toDoListUser({
                    'user_id': user,
                    'list_id': toDo
                })
        print("toDoListUser seeding complete")

    def create_toDoListUser(self, data):
        try:
            Permission.objects.create(
                user_id = data["user_id"],
                list_id = data["list_id"]
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating ToDoListUser: {str(e)}'))
  

    def generate_events(self):
        # Clear existing events
        Appointments.objects.all().delete()

        # Seed events for each user
        for user in User.objects.all():
            for i in range(5):  # Create 5 events per user
                naive_start_date = datetime.now() + timedelta(days=random.randint(1, 30))
                naive_end_date = naive_start_date + timedelta(hours=random.randint(1, 5))

                # Make the datetime objects timezone-aware
                start_date = make_aware(naive_start_date)
                end_date = make_aware(naive_end_date)

                Appointments.objects.create(
                    user=user,
                    name="CLASS for STUDENTS",
                    start_date=start_date,
                    end_date=end_date,
                    comments=f"Sample comment for event {i + 1}",
                )
        self.stdout.write(self.style.SUCCESS('Successfully seeded events for all users.'))
        

    # Helper functions
    def create_username(self, first_name, last_name):
        return '@' + first_name.lower() + last_name.lower()


    def create_email(self, first_name, last_name):
        return first_name.lower() + '.' + last_name.lower() + '@example.org'
