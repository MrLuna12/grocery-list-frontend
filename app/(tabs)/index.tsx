import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>You have no grocery lists yet!</Text>
      <Text style={styles.emptySubtitle}>Create your first list to get started</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [groceryLists, setGroceryLists] = useState([]);
  return (
    <View style={styles.container}>
      {groceryLists.length === 0 ? (
        <EmptyState />
      ) : (
        <Text style={styles.text}>You have {groceryLists.length} lists!</Text>
      )}
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
});