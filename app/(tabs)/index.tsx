import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { createGroceryList, fetchGroceryLists, GroceryList } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
  const [listNameInput, setListNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();

  const handleOpenModal = () => {
    setIsModalVisible(true);
  }

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setListNameInput('');
  }

  const handleCreateFirstList = async () => {
    try {
      setIsLoading(true);
      console.log('Creating first grocery list...');
      const token = await getToken();

      console.log('Token received:', token);

      if (!token) {
        console.log('No auth token found');
        setIsLoading(false)
        return;
      }

      const newList = await createGroceryList({ title: listNameInput }, token);
      console.log('Created list:', newList);
      const allLists = await fetchGroceryLists(token);
      setGroceryLists(allLists);

      handleCloseModal();
    } catch (error) {
      console.log('Error creating list:', error);
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <View style={styles.container}>
      {groceryLists.length === 0 ? (
        <EmptyState onCreateFirstList={handleOpenModal} />
      ) : (
        <Text style={styles.text}>You have {groceryLists.length} lists!</Text>
      )}
      <Modal
        visible={isModalVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={handleCloseModal}
      >

        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.textInput}
              placeholder='Enter list name...'
              value={listNameInput}
              onChangeText={setListNameInput}
              autoFocus={true}
              maxLength={50}>
            </TextInput>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.createModalButton,
                  (isLoading || listNameInput.trim().length === 0) && styles.disabledButton
                ]}
                onPress={handleCreateFirstList}
                disabled={isLoading || listNameInput.trim().length === 0}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.createModalButtonText}>Creating...</Text>
                  </View>
                ) : (
                  <Text style={styles.createModalButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: '100%',
    marginBottom: 20,
    minWidth: 250,
    textAlign: 'left',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  createModalButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  createModalButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});