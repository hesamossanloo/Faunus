import { useProperty } from "@/providers/PropertyProvider";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SelectedBottomSheet: React.FC = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { isShapeSelected } = useProperty();

  useEffect(() => {
    if (isShapeSelected) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isShapeSelected]);
  return (
    <BottomSheet
      index={-1}
      snapPoints={[200]}
      enablePanDownToClose
      ref={bottomSheetRef}
      backgroundStyle={{ backgroundColor: "#414442 " }}
    >
      <BottomSheetView style={styles.viewContainer}>
        <Text style={styles.title}>Selected Property</Text>
        <View style={styles.viewRow}>
          <Text style={styles.text}>Owner:</Text>
          <Text style={styles.text}>Mads Haneborg Property</Text>
        </View>

        <View style={styles.viewRow}>
          <Text style={styles.text}>ID:</Text>
          <Text style={styles.text}>3226.163.2</Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log("Add comment");
            }}
          >
            <Text style={styles.text}>Add Comment</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#414442",
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#fff",
  },
  viewRow: {
    flexDirection: "row",
    gap: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default SelectedBottomSheet;
