from django.test import TestCase
from api.models.user import User
from api.models.rewards import Rewards
from datetime import datetime

class RewardsModelTest(TestCase):
    def setUp(self):
        #Set up test user and reward instance
        self.user = User.objects.create_user(email = "test_user@email.com", description = "", firstname = "test_user", lastname = "test_user", username = "test_user", password = "test_user")
        self.rewards = Rewards.objects.create(user=self.user, reward_number=1)

    def test_reward_creation(self):
        self.assertEqual(self.rewards.user.username, "test_user")
        self.assertEqual(self.rewards.reward_number, 1)
        self.assertIsNotNone(self.rewards.date_earned) # automatically added time stamp when earned

    def test_foreign_key_links(self):
        # check if it is linked to the correct user
        self.assertEqual(self.rewards.user, self.user)
        self.assertEqual(self.rewards.user_id, self.user.user_id)
        self.assertNotEqual(self.rewards.user.username, "not_test_user")

    def test_str_method(self):
        expected_str = f"test_user - Reward 1"
        self.assertEqual(str(self.rewards), expected_str)


    ## These tests will make more sense to implement once it has been linked to FireBase ##


    #def test_reward_retrieval(self):
        #Tests if the reward is correctly retrieved from firebase

    #def test_invalid_reward_number(self):
        #Test what happens when the reward_id DOES NOT have a corresponding reward in FireBase
        #self.rewards = Rewards.objects.create(user=self.user, reward_number=90293092039203940238420384)

    #def test_correct_reward_trigger(self):
        #Test to make sure the user gets correct reward based on trigger
