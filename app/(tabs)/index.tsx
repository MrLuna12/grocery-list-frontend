import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { createGroceryList, fetchGroceryLists, GroceryList } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CreateListModal from '../../components/CreateListModal';

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
  const { getToken } = useAuth();

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

      if (lists.length > 0 && !selectedList) {
        setSelectedList(lists[0]);
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
    console.log('Created list:', newList);

    await loadGroceryLists();

    setSelectedList(newList);
  };

useEffect(() => {
  loadGroceryLists();
}, []);

  return (
    <View style={styles.container}>
      {groceryLists.length === 0 ? (
        <EmptyState onCreateFirstList={handleOpenModal} />
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.selectedListTitle}>
            {selectedList ? selectedList.title : 'Select a list'}
          </Text>
          <Text style={styles.listCount}>
            {groceryLists.length} {groceryLists.length === 1 ? 'list' : 'lists'} total
          </Text>
          <Text style={styles.placeholder}>Items will appear here</Text>
        </View>
      )}

      <CreateListModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onCreateList={handleCreateList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  selectedListTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
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
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40
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