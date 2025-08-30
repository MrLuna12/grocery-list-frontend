import CreateItemModal from '@/components/CreateItemModal';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { SafeAreaView } from 'react-native-safe-area-context';
import CreateListModal from '../../components/CreateListModal';
import ListDropdown from '../../components/ListDropdown';
import { useAuth } from '../../context/AuthContext';
import { createGroceryList, createItem, fetchGroceryItems, fetchGroceryLists, GroceryList, Item } from '../../services/api';

interface EmptyListsStateProps {
  onCreateFirstList: () => void;
}

interface EmptyItemsStateProps {
  selectedList: GroceryList;
}

function EmptyListsState({ onCreateFirstList }: EmptyListsStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>You have no grocery lists yet!</Text>
      <Text style={styles.emptySubtitle}>Create your first list to get started</Text>
      <TouchableOpacity style={styles.createButton} onPress={onCreateFirstList}>
        <Text style={styles.createButtonText}>Create First List</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyItemsState({ selectedList }: EmptyItemsStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>You have no grocery items yet!</Text>
      <Text style={styles.emptySubtitle}>Add your first item to your {selectedList.title} list</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<GroceryList | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const { getToken, user, logout } = useAuth();

  const handleOpenListModal = () => {
    setIsListModalVisible(true);
  };

  const handleCloseListModal = () => {
    setIsListModalVisible(false);
  };

  const handleOpenItemModal = () => {
    setIsItemModalVisible(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalVisible(false);
  };

  const loadGroceryLists = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const lists = await fetchGroceryLists(token);
      setGroceryLists(lists);

      if (lists.length > 0) {
        if (selectedList) {
          const stillExists = lists.find(list => list.id === selectedList.id);
          if (stillExists) {
            setSelectedList(stillExists);
            await loadItemsForList(stillExists.id);
          } else {
            setSelectedList(lists[0]);
            await loadItemsForList(lists[0].id);
          }
        } else {
          setSelectedList(lists[0]);
          await loadItemsForList(lists[0].id);
        }
      } else {
        setSelectedList(null);
        setItems([]);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_EXPIRED') {
        console.log("loging out the user")
        await logout();
      }
      console.error('Error loading grocery lists:', error);
    }
  };

  const handleCreateList = async (listName: string) => {
    const token = await getToken();

    if (!token) {
      throw new Error('Please log in again');
    }

    await createGroceryList({ title: listName }, token);
    await loadGroceryLists();
  };

  const handleSelectList = (list: GroceryList) => {
    setSelectedList(list);
    loadItemsForList(list.id);
  };

  const loadItemsForList = async (listId: number) => {
    try {
      const token = await getToken();
      if (!token) return;

      const items = await fetchGroceryItems(listId, token);
      setItems(items);
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
    }
  };

  const handleCreateItem = async (itemName: string, quantity: number) => {
    const token = await getToken();

    if (!token) {
      throw new Error('Please log in again');
    }

    if (!selectedList) {
      throw new Error('Please select a list first');
    }

    const newItem = await createItem(selectedList.id, { name: itemName, quantity }, token);

    await loadItemsForList(selectedList.id);

    console.log('Item created successfully:', newItem);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  useEffect(() => {
    if (user) {
      loadGroceryLists();
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        {groceryLists.length === 0 ? (
          <Text style={styles.headerTitle}>Grocery Lists</Text>
        ) : (
          <View style={styles.headerDropdownContainer}>
            <ListDropdown
              selectedList={selectedList}
              groceryLists={groceryLists}
              onSelectList={handleSelectList}
              onCreateNew={handleOpenListModal}
            />
          </View>
        )}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={styles.logoutButton}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <MaterialIcons name="logout" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      </View>

      {groceryLists.length === 0 ? (
        <EmptyListsState onCreateFirstList={handleOpenListModal} />
      ) : (
        <View style={styles.listContainer}>
          {/* Main content area */}
          {items.length === 0 ? (
            <View style={styles.contentArea}>
              <EmptyItemsState selectedList={selectedList!} />
            </View>
          ) : (
            <View style={styles.contentArea}>
              <FlatList
                data={items}
                renderItem={({ item }) => {
                  return (
                    <View style={styles.itemContainer}>
                      <View style={styles.checkboxContainer}>
                        <BouncyCheckbox
                          text={item.name}
                          size={24}
                          fillColor="#007AFF"
                          unFillColor="#FFFFFF"
                          iconStyle={{ borderColor: "#E0E0E0", borderRadius: 6 }}
                          innerIconStyle={{ borderWidth: 2, borderRadius: 4 }}
                          textStyle={styles.itemText}
                          onPress={(isChecked) => { console.log(isChecked) }}
                        />
                      </View>
                      <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
                    </View>
                  );
                }}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
          <TouchableOpacity style={styles.createItemButton} onPress={handleOpenItemModal}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <CreateListModal
        visible={isListModalVisible}
        onClose={handleCloseListModal}
        onCreateList={handleCreateList}
      />

      <CreateItemModal
        visible={isItemModalVisible}
        onClose={handleCloseItemModal}
        onCreateItem={handleCreateItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Custom header styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerDropdownContainer: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  listContainer: {
    flex: 1,
  },
  // Dropdown right below header
  dropdownContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  // Main content area
  contentArea: {
    flex: 1,
    padding: 10,
  },
  // List styles
  listContent: {
    paddingVertical: 8
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  listCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  // Empty state styles
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    flex: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },

  createItemButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});