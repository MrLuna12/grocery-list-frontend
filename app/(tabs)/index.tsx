import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
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
  const { getToken } = useAuth();

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleCreateList = async (listName: string) => {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Please log in again');
    }

    const newList = await createGroceryList({ title: listName }, token);
    console.log('Created list:', newList);
    
    const allLists = await fetchGroceryLists(token);
    setGroceryLists(allLists);
  };

  return (
    <View style={styles.container}>
      {groceryLists.length === 0 ? (
        <EmptyState onCreateFirstList={handleOpenModal} />
      ) : (
        <Text style={styles.text}>You have {groceryLists.length} lists!</Text>
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