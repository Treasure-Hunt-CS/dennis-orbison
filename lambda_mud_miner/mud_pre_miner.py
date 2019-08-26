from threading import Thread
from multiprocessing import Process, current_process, freeze_support
import hashlib
import requests

import sys
import os

from uuid import uuid4
import time

process_id = os.getpid()

coins_mined = 0
pre_mined = {}


class Miner ():
    def __init__(self, last_proof=0, base=0, difficulty=1, multiplier=0, multiply_rate=10000000):
        self.base = base
        self.step = 0
        self.last_proof = last_proof
        self.difficulty = difficulty
        self.multiplier = multiplier
        self.multiply_rate = multiply_rate

    def set_difficulty(self, difficulty):
        self.difficulty = difficulty

    def set_last_proof(self, last_proof):
        self.last_proof = last_proof

    def proof_of_work(self):

        # starting of searching next proof
        print("Searching for next proof")

        # setting proof starting point
        proof = self.base

        # initial point of proof string from starting proof
        # proof_string = self.full_char_cycle(proof)
        proof_string = self.set_char(self.multiplier, proof=proof)

        # looping through proof until found right proof that match condition based on difficulty
        while self.valid_proof(proof, proof_string) is False:

            # messures lambda has rate
            self.lambda_hash_rate(proof, proof_string)

            # increment next proof to be hashed
            self.proof += 1

            # updating proof
            proof = self.increment_step()

            # calculating next proof string to be hashed
            proof_string = self.full_char_cycle(
                proof, self.multiplier, proof_string)

        # prints found proof
        print("Proof found: " + str(proof_string))

        # returns proof string but don't know why
        return proof_string

    def proof_of_work_mulitpier(self):
        print("Searching for next proof")
        proof = self.base
        self.proof = proof
        proof_string_list = [""] * (self.multiplier + 1)
        # for index in range(self.multiplier + 1):
        #     proof_string_list[index] = self.set_char(index)
        # print(proof_string_list)
        found = False
        while found is False:
            for multiply in range(self.multiplier + 1):
                set_multiply = multiply * self.multiply_rate
                proof_string_list[multiply] = self.set_char(multiply, proof)
                # proof_string_list[multiply] = self.full_char_cycle(
                #     proof, set_multiply, proof_string_list[multiply])
                if self.instance_of_Proof(proof, set_multiply, proof_string_list[multiply]):
                    value = self.multiplier + proof
                    found = True
                    break
                else:
                    proof_string_list[multiply]
            proof += 1
            # print(proof, proof_string_list)
            self.proof = proof
            self.lambda_hash_rate(proof, proof_string_list)
        return value

    def valid_proof(self, proof, proof_string):
        # self.lambda_hash_rate(proof)

        # encoding last proof and next proof into a utf-8 string
        guess = f'{self.last_proof}{proof_string}'.encode()

        # hashing the guess
        guess_hash = hashlib.sha256(guess).hexdigest()

        # checking if hashed guess matches condition
        if guess_hash[:self.difficulty] == "0" * self.difficulty:

            # record end time to messure time to find proof
            self.end = time.time()

            # proof is found
            self.found_proof(proof, proof_string)

        return guess_hash[:self.difficulty] == "0" * self.difficulty

    def found_proof(self, proof, proof_string):

        # calculate time to find proof
        duration = self.end - self.start

        # calculate hash rate
        proof_hash = self.proof * (self.multiplier + 1)
        LHR = proof_hash / duration

        # update pre mined
        self.update_pre_mined(proof_string)

        # submit proof
        self.submit_proof(proof_string)

        # print data
        print("  -- Lambda Hash Rate: ", LHR)
        print("  -- New Proof: ", proof, proof_string)
        print("  -- last proof: ", self.last_proof)
        print("  -- difficulty: ", self.difficulty)
        print("  -- mine duration: ", duration,)

        # press enter or wait 10 sec to continue on, will change to wait 10 sec
        input("press enter to continue")

    def submit_proof(self, proof):

        # set end point
        API_ENDPOINT = 'http://localhost:8000/api/submit-proof'

        # set data
        data = {"proof": proof}

        # send proof to server
        response = requests.post(url=API_ENDPOINT, data=data)

        # print message
        json_resonpse = response.json()
        print(json_resonpse["message"])

    def update_pre_mined(self, proof):
        if self.difficulty not in pre_mined:
            pre_mined[self.difficulty] = {}
        pre_mined[self.difficulty][self.last_proof] = proof
        print(" -- size of pre-mind: ", len(pre_mined))
        print(pre_mined)

    def mine(self):
        # set miner id
        self.get_miner_id()

        # wait 2 minutes for all miners to boot then continue on
        # set base proof starting point based on how many miners exist
        self.set_base_proof()

        # start mining process
        while True:

            # starting point of mine
            self.start = time.time()

            # reseting step back to zero
            self.step = 0

            # retrieve last proof
            self.get_last_proof()

            # seleting which POW algorithm based on miner mulitpiler
            if self.multiplier != 0:

                # algorithm for many miner multipliers
                self.proof_of_work_mulitpier()
            else:

                # algorithm for 1 miner multiplier
                self.proof_of_work()

    def get_last_proof(self):
        response = requests.get('http://localhost:8000/api/get-proof')
        json_resonpse = response.json()
        self.set_difficulty(json_resonpse["difficulty"])
        self.set_last_proof(json_resonpse["proof"])

    def get_miner_id(self):
        response = requests.get('http://localhost:8000/api/get-miner-id')
        json_resonpse = response.json()
        self.miner_id = json_resonpse["miner_id"]

    def set_base_proof(self):
        response = requests.get('http://localhost:8000/api/get-total-miners')
        json_resonpse = response.json()
        total_miners = json_resonpse["total_miners"]
        step = self.step
        miner_id = self.miner_id
        proof_range = 10000000000
        self.base = miner_id * proof_range + step * total_miners * proof_range

    def increment_step(self):
        # need to double check proof range
        # set base proof is corrlated with proof range
        self.proof_range = 10000000000
        if self.proof == self.proof_range:
            self.step
            self.set_base_proof()
            self.proof = self.base

            # not sure to do this or not need to check but setting it for now
            # self.proof += 1
        return self.proof

    def run(self):
        self.mine()

    def lambda_hash_rate(self, proof, proof_string):
        # if proof % 55294 == 0:
        #     print(proof_string, len(proof_string))
        if proof % 1000000 == 0 and proof != 0:
            self.end = time.time()
            duration = self.end - self.start
            proof = proof * (self.multiplier + 1)
            LHR = proof / duration
            print("multipier rate", self.multiplier)
            print("Lambda Hash rate:", LHR)
            print("proof_string", proof_string)
            print("proof_string size", len(proof_string))
            print("last proof", self.last_proof)
            print("current proof", self.proof)

            # set up function to check if last proof as been changed
            # if it has reset miner

    def instance_of_Proof(self, proof, multiplier=0, proof_string=""):
        proof = multiplier + proof
        return self.valid_proof(proof, proof_string)

    def full_char_cycle(self, proof, multiplier=0, string=""):
        proof_range = 55295
        proof = multiplier + proof
        num = proof % proof_range
        pointer = 0
        size = len(string)
        text = chr(num)

        if num == 0:
            if size == 0:
                string = f'{text}{string}'
            else:
                while True:
                    if size - 1 >= pointer:
                        current = size - 1 - pointer
                        value = string[current: len(string) - pointer]
                        value = ord(value)
                        value += 1
                    else:

                        text = chr(num)
                        string = f'{text}{string}'
                        size = len(string)
                        pointer = 0
                        break

                    if value == proof_range:
                        value = 0
                        text = chr(value)
                        current = size - 1 - pointer
                        string = f'{string[ : current]}{text}{string[current + 1 : ]}'
                        pointer += 1
                    else:
                        text = chr(value)
                        current = size - 1 - pointer
                        string = f'{string[ : current]}{text}{string[current + 1 : ]}'
                        pointer = 0
                        break

        else:
            text = chr(num)
            current = size - 1 - pointer
            string = f'{string[ : current]}{text}{string[current + 1 : ]}'

        # if num == 65:
        #     print(string)

        return string

    def set_char(self, multiplier=0, proof=0):
        # updating proof for multiplier miner
        proof = multiplier * self.multiply_rate + proof

        # setting empty string
        string = ""

        # algorithm setting proof string
        while proof >= 55295:

            # this condition maybe redundent
            if proof >= 55295:

                # setting num for char equivlant
                num = proof % 55295

                # updating string
                text = chr(num)
                string = f'{text}{string}'
                proof = (proof // 55295)

        # condition to check for proof if at 0
        if proof != 0:
            num = (proof % 55295) - 1
        else:
            num = (proof % 55295)

        # updating string
        text = chr(num)
        string = f'{text}{string}'
        return string


miner = Miner(last_proof=0, difficulty=7, multiplier=23)
miner2 = Miner(last_proof=10, difficulty=6, multiplier=14)

# miner2.mine()
# miner2.get_last_proof()
# miner2.get_miner_id()
# miner2.submit_proof(1234)

# t = Thread(target=miner.mine)
# t2 = Thread(target=miner2.mine)

# t.start()
# t2.start()

# print("testing threading here")
# miner.test_print()


# def test(message):
#     print(message)
#     print("this is a process test")


# print("starting process")
# process = Process(target=miner.mine, args=(pre_mined,))
# process2 = Process(target=miner2.mine, args=(pre_mined,))


# if __name__ == '__main__':
#     freeze_support()
#     process.start()
#     process2.start()


# 40
# Lambda Hash rate: 379233.5600740309
# Lambda Hash rate: 378802.13133801345
# new proof:  222768594 last proof:  0 difficulty:  7 time to mine:  299.6613392829895 size of pre-mind:  1
# {7: {0: 222768594}}
# press enter to continue


# 0
# Lambda Hash rate: 362587.56464069075
# Lambda Hash rate: 362583.56940740696
# new proof:  222768594 last proof:  0 difficulty:  7 time to mine:  614.3924126625061 size of pre-mind:  1
# {7: {0: 222768594}}
# press enter to continue

# 1
# Lambda Hash rate: 329108.26273119106
# Lambda Hash rate: 329109.43829436373
# new proof:  222768594 last proof:  0 difficulty:  7 time to mine:  1292.9960021972656 size of pre-mind:  1
# {7: {0: 222768594}}
# press enter to continue

# 20
# Lambda Hash rate: 374306.00849751756
# Lambda Hash rate: 374245.63379712164
# new proof:  222768594 last proof:  0 difficulty:  7 time to mine:  1277.6113622188568 size of pre-mind:  1
# {7: {0: 222768594}}
# press enter to continue


# 22
# Lambda Hash rate: 372516.2946834552
# Lambda Hash rate: 372244.43595218577
# new proof:  222768594 last proof:  0 difficulty:  7 time to mine:  171.06410694122314 size of pre-mind:  1
# {7: {0: 222768594}}
# press enter to continue

# 23
# Lambda Hash rate: 370608.88344447844
# Lambda Hash rate: 371482.3722102683
# new proof:  222768594 last proof:  0 difficulty:  7 time to mine:  178.86785745620728 size of pre-mind:  1
# {7: {0: 222768594}}
# press enter to continue

# print("working")
# num = "가다"
# test = num.encode()
# test = test.decode()
# # test = num.decode("binary")
# print(test)

# # num = 65
# # text = f'\{hex(num)}'
# text = text.encode()
# text = text.decode()
# print(text)

# text = chr(1114111)
# print(text)
# stuff = "aaa"
# text = text.encode()
# print(text)
# arr = '0'
# for num in range(1114111 + 1):
#     if num == 1114111:
#         arr = f'1{arr}'
#         print("working", num % 1114111, arr)
#     if num == 1114110:
#         print("well???", num % 1114111)

# num = 0
# string = ""
# while True:
#     if num == 1114112:
#         num = 0
#     if num == 0:
#         if len(string) == 0:
#             text = chr(num)
#             string = f'{text}{string}'
#             size = len(string)
#             pointer = 0
#         else:
#             while True:
#                 if size - 1 >= pointer:
#                     current = size - 1 - pointer
#                     value = string[current: len(string) - pointer]
#                     value = ord(value)
#                     value += 1
#                 else:
#                     text = chr(num)
#                     string = f'{text}{string}'
#                     size = len(string)
#                     pointer = 0
#                     break

#                 if value == 1114112:
#                     value = 0
#                     text = chr(value)
#                     current = size - 1 - pointer
#                     string = f'{string[ : current]}{text}{string[current + 1 : ]}'
#                     pointer += 1
#                 else:
#                     text = chr(value)
#                     current = size - 1 - pointer
#                     string = f'{string[ : current]}{text}{string[current + 1 : ]}'
#                     pointer = 0
#                     break

#     else:
#         text = chr(num)
#         current = size - 1 - pointer
#         string = f'{string[ : current]}{text}{string[current + 1 : ]}'

#     if num == 65:
#         print(string)

#     num += 1


# 0
# Lambda Hash rate: 263913.11183234776 ੏勐 2 146000000
# Lambda Hash rate: 263905.2750931785
# new proof:  146634723 proof string:  ਗ਼먾 last proof:  10 difficulty:  7 time to mine:  555.6339218616486 size of pre-mind:  1
# {7: {10: 146634723}}
# press enter to continue


# 횽 2
# Ł횼 2
# ł횻 2
# Ń횺 2
# 0
# Lambda Hash rate: 252472.0246613568 ń燅 2 18000000
# ń횹 2
# Ņ횸 2
# ņ횷 2
# Ň횶 2
# ň횵 2
# ŉ횴 2
# Ŋ횳 2
# ŋ횲 2
# Ō횱 2
# ō횰 2
# Ŏ횯 2
# ŏ횮 2
# Ő횭 2
# ő횬 2
# Œ횫 2
# œ횪 2
# Ŕ횩 2
# ŕ효 2


# Lambda Hash rate: 242330.78308374452 ['k淫', 'Ġ䴠', 'Ǖⱕ', 'ʊஊ', '̾슾', 'ϳꇳ', 'Ҩ脨', '՝恝', 'ؒ㾒', 'ۇệ', 'ݻ헻', '࠰따', 'ࣥ鑥', 'চ玚',
#  '\u0a4f勏'] 15 6000000
# Lambda Hash rate: 242140.23850022943
# new proof:  146634723 proof string:  ਗ਼먾 last proof:  10 difficulty:  7 time to mine:  411.0049846172333 size of pre-mind:  1
# {7: {10: 146634723}}
# press enter to continue


# visited_rooms = {}
# ------------------------------------------
# visited_rooms[0] = { n:false, e:false, w:false, s:false }

# check for rooms not visited
#  - some roomes not visited
#  - record previous room = 0
#  - go east

# get room id = 4
# update previous room id exits
#  - visited_rooms[0] = {exit: {n:false, e:4, w:false, s:false}, title: ""}

# get exits = [w]
# update the direction we came from w = 0
# visited_rooms[4] = {exit: {w:0}, is_buyer: true}
# ----------------------------------------
# check for rooms not visited
#  - all rooms visited
#  - go towards the room with smallest id
#  - or go to previous room w
# ----------------------------------------
# check for rooms not visited
#  - some rooms not visited
#  - record previous room = 0
#  - go west

#  get room id = 3
#  update previous room id exits
#  - visited_rooms[0] = {n:false, e:4, w:3, s:false}

#  get exits = [n, e, s]
#  update the direction we came from e = 0
#  visited_rooms[3] = {n:false, e:0, s:false}
# -------------------------------------------
# check for rooms not visited
#  - some rooms not visited
#  - record previous room = 3
#  - go south

#  get room id = 7
#  update previous room id exits
#  - visited_rooms[3] = {n:false, e:0, s:7}

#  get exits = [n, e, s]
#  update the direction we came from s = 3
#  visited_rooms[7] = {n:3}
# ----------------------------------------
# check for rooms not visited
#  - all rooms visited
#  - go towards the room with smallest id
#  - or go to previous room n
# ----------------------------------------
# check for rooms not visited
#  - some rooms not visited
#  - record previous room = 3
#  - go north

#  get room id = 8
#  update previous room id exits
#  - visited_rooms[3] = {n:8, e:0, s:7}


#  get exits = [n, s]
#  update the direction we came from s = 3
#  visited_rooms[8] = {n:false, s:3}
#  ----------------------------------------
# check for rooms not visited
#  - some rooms not visited
#  - record previous room = 8
#  - go north

#  get room id = 13
#  update previous room id exits
#  - visited_rooms[8] = {n:13, s:3}

#  get exits = [e, w, s]
#  update the direction we came from s = 8
#  visited_rooms[13] = {e:false, w:false, s:8}
