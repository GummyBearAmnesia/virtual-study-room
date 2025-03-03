import logging
logging.basicConfig(level=logging.INFO, handlers=[logging.StreamHandler()])
from django.core.management.base import BaseCommand, CommandError
from api.models.motivational_message import MotivationalMessage

from django.core.management import call_command

from api.models import Friends, User, Status, toDoList, Permission, MotivationalMessage, Rewards, StudySession, SessionUser, List


import pytz
from faker import Faker
from django.utils.timezone import now
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
            call_command('loaddata', 'api/tests/fixtures/default_study_session.json')
            call_command('loaddata', 'api/tests/fixtures/default_session_users.json')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error while seeding database: {e}'))
      
        self.seed_motivationalMessage()
        self.generating_users()
        self.generate_random_friends()
        self.generating_rewards()
        self.generate_random_Lists()
        self.generate_random_toDoLists()
        self.generate_toDoListUsers()
        self.generating_study_sessions()
        self.generating_session_users()


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
        reward_id = randint(1,100)      # would be linked to firebase but for now is random numbers
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
            if toDo.is_shared:
                num_permissions = randint(2, len(users))
            else:
                num_permissions = 1
            
            selected_users = sample(users, num_permissions)

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

    """Seeder for Study Sessions"""
    def generating_study_sessions(self):
        for x in range(self.SESSION_COUNT):
            print(f"Seeding study session {x+1}/{self.SESSION_COUNT}", end='\r')
            self.generate_random_study_session()
        print("Study Sessions seeding complete!")

    def generate_random_study_session(self):
        user = choice(User.objects.all())
        session_name = self.faker.sentence(nb_words=4)
        start_time = now()

        # Decide if session has ended or is ongoing
        is_ongoing = randint(0, 1)  # 50% chance of session being ongoing
        if is_ongoing:
            end_time = None  # Session is still ongoing
        else:
            # Session has ended
            end_time = start_time + timedelta(hours=randint(1, 5))

        session_date = date.today()

        try:
            StudySession.objects.create(
                createdBy=user, 
                sessionName=session_name, 
                startTime=start_time, 
                endTime=end_time, 
                date=session_date
            )
        except Exception as e:
            print(f"Failed to create study session: {e}")
    
    """Seeder for Study Session Users"""
    def generating_session_users(self):
        sessions = list(StudySession.objects.all())
        users = list(User.objects.all())
        session_user_count = 0

        if not sessions or not users:
            print("No sessions or no users found. Skipping session user seeding.")
            return
        
        #Making sure every session has at least 1 user 
        for session in sessions:
            user = choice(users)
            self.create_session_user(user, session)
            session_user_count += 1
            if session_user_count >= self.SESSION_USER_COUNT:
                return
        
        #Add remaining random no. of users to random sessions
        while session_user_count < self.SESSION_USER_COUNT:
            user = choice(users)
            session = choice(sessions)
            self.create_session_user(user, session)
            session_user_count +=1
        
        print("Study Session Users seeding complete!")

    def create_session_user(self, user, session):
        joined_at_time = now()
    
        if session.endTime is None:
            # Session is ongoing
            has_left = randint(0, 1)  # 50% chance user has left
            
            if has_left:
                # User left sometime after 1 or 2 hrs
                left_at_time = joined_at_time + timedelta(hours=randint(1,2))
            else:
                # User is still in the session
                left_at_time = None
        else:
            # Session has ended, so all users must have left
            # User left sometime between joining and session end
            end_time = session.endTime

            max_duration = (end_time - joined_at_time).total_seconds()
            random_duration = randint(60, int(max_duration)) if max_duration > 60 else 60
            left_at_time = joined_at_time + timedelta(seconds=random_duration)
        try:
            SessionUser.objects.create(
                user=user,
                session=session,
                status=choice(['FOCUSED', 'CASUAL']),
                focus_target=self.faker.sentence(nb_words=6) if randint(0, 1) else None,
                joined_at= joined_at_time,
                left_at = left_at_time
            )
        except Exception as e:
            print(f"Failed to create session user: {e}")
        


    # Helper functions
    def create_username(self, first_name, last_name):
        return '@' + first_name.lower() + last_name.lower()


    def create_email(self, first_name, last_name):
        return first_name.lower() + '.' + last_name.lower() + '@example.org'