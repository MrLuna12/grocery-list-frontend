import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';

interface CreateItemModalProps {
    visible: boolean;
    onClose: () => void;
    onCreateItem: (name: string, quantity: number) => Promise<void>;
}

export default function CreateItemModal({ visible, onClose, onCreateItem }: CreateItemModalProps) {
    const [itemNameInput, setItemNameInput] = useState('');
    const [quantityInput, setQuantityInput] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleClose = () => {
        setItemNameInput('');
        setErrorMessage('');
        setQuantityInput('1');
        onClose();
    };

    const handleCreate = async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');

            await onCreateItem(itemNameInput, parseInt(quantityInput));

            handleClose();
        } catch (error: any) {
            console.log('Error creating item:', error);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType='slide'
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Create New Item</Text>

                    <TextInput
                        style={styles.textInput}
                        placeholder='Enter Item name...'
                        value={itemNameInput}
                        onChangeText={(text) => {
                            setItemNameInput(text);
                            if (errorMessage) setErrorMessage('');
                        }}
                        autoFocus={true}
                        maxLength={50}
                    />

                    <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        placeholder='Enter quantity number...'
                        value={quantityInput}
                        onChangeText={(text) => {
                            setQuantityInput(text);
                            if (errorMessage) setErrorMessage('');
                        }}
                        maxLength={50}
                    />

                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.createModalButton,
                                (isLoading || itemNameInput.trim().length === 0) && styles.disabledButton
                            ]}
                            onPress={handleCreate}
                            disabled={isLoading || itemNameInput.trim().length === 0}
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
    );
}

const styles = StyleSheet.create({
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
    errorText: {
        color: '#ff3333',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
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