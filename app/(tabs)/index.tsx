import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createGroceryList, fetchGroceryLists, GroceryList } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CreateListModal from '../../components/CreateListModal';
import ListDropdown from '../../components/ListDropdown';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  onCreateFirstList: () => void;
}

function EmptyState({ onCreateFirstList }: EmptyStateProps) {
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

export default function HomeScreen() {
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<GroceryList | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { getToken, user, logout } = useAuth();

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
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
          } else {
            setSelectedList(lists[0]);
          }
        } else {
          setSelectedList(lists[0]);
        }
      } else {
        setSelectedList(null);
      }
    } catch (error) {
      console.error('Error loading grocery lists:', error);
    }
  };

  const handleCreateList = async (listName: string) => {
    const token = await getToken();

    if (!token) {
      throw new Error('Please log in again');
    }

    const newList = await createGroceryList({ title: listName }, token);
    await loadGroceryLists();
    setSelectedList(newList);
  };

  const handleSelectList = (list: GroceryList) => {
    setSelectedList(list);
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
              onCreateNew={handleOpenModal}
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
        <EmptyState onCreateFirstList={handleOpenModal} />
      ) : (
        <View style={styles.listContainer}>
          {/* Main content area */}
          <View style={styles.contentArea}>
            <Text style={styles.listCount}>
              {groceryLists.length} {groceryLists.length === 1 ? 'list' : 'lists'} total
            </Text>

            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholder}>
                {selectedList
                  ? `Items from "${selectedList.title}" will appear here`
                  : 'Select a list to view items'
                }
              </Text>
            </View>
          </View>
        </View>
      )}

      <CreateListModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onCreateList={handleCreateList}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    fontSize: 24,
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
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});