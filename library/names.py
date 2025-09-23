# Node class represents each element in the list
class Node:
    def __init__(self, name):
        self.name = name      # stores the name
        self.next = None      # pointer to the next node


# LinkedList class manages the list
class LinkedList:
    def __init__(self):
        self.head = None

    # Add a new name at the end of the list
    def add(self, name):
        new_node = Node(name)
        if not self.head:   # if list is empty
            self.head = new_node
        else:
            current = self.head
            while current.next:  # move to the last node
                current = current.next
            current.next = new_node

    # Remove a name from the list
    def remove(self, name):
        current = self.head
        prev = None
        while current:
            if current.name == name:
                if prev:
                    prev.next = current.next
                else:
                    self.head = current.next
                return True
            prev = current
            current = current.next
        return False

    # Display the names in the list
    def display(self):
        current = self.head
        if not current:
            print("The list is empty.")
        else:
            while current:
                print(current.name)
                current = current.next


# --- Example usage ---
my_list = LinkedList()
my_list.add("Alice")
my_list.add("Bob")
my_list.add("Charlie")
my_list.add("Garfield")

print("Current List:")
my_list.display()

print("\nRemoving Bob...")
my_list.remove("Bob")

print("Updated List:")
my_list.display()
