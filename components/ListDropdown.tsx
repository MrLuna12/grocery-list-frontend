import { StyleSheet, Text, View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { GroceryList } from '../services/api';

interface ListDropdownProps {
    selectedList: GroceryList | null;
    groceryLists: GroceryList[];
    onSelectList: (list: GroceryList) => void;
    onCreateNew: () => void;
}

export default function ListDropdown({
    selectedList,
    groceryLists,
    onSelectList,
    onCreateNew
}: ListDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectList = (list: GroceryList) => {
        onSelectList(list);
        setIsOpen(false);
    };

    const handleCreateNew = () => {
        onCreateNew();
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setIsOpen(true)}
            >
                <Text style={styles.selectedText}>
                    {selectedList ? selectedList.title : 'Select a list'}
                </Text>
                <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={styles.dropdownMenu}>
                        <TouchableOpacity
                            style={styles.createNewOption}
                            onPress={handleCreateNew}
                        >
                            <Text style={styles.createNewText}>+ Create New List</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <FlatList
                            data={groceryLists}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.listOption,
                                        selectedList?.id === item.id && styles.selectedOption
                                    ]}
                                    onPress={() => handleSelectList(item)}
                                >
                                    <Text style={[
                                        styles.listOptionText,
                                        selectedList?.id === item.id && styles.selectedOptionText
                                    ]}>
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 300,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 48,
    },
    selectedText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    arrow: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownMenu: {
        backgroundColor: '#fff',
        borderRadius: 8,
        minWidth: 250,
        maxWidth: 300,
        maxHeight: 300,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    createNewOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    createNewText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
    },
    listOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedOption: {
        backgroundColor: '#e3f2fd',
    },
    listOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
});