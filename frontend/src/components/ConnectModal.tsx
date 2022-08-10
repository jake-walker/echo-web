import { Button, Select, SelectItem, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Check, CheckCircle, X, XCircle } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import { chatActions } from "../slices/chat";
import { RootState } from "../store";

function ConnectModal() {
  const dispatch = useDispatch();

  const stateBridgeAddress = useSelector((state: RootState) => state.chat.bridgeAddress);
  const stateServerAddress = useSelector((state: RootState) => state.chat.serverAddress);
  const stateUsername = useSelector((state: RootState) => state.chat.username);
  const statePassword = useSelector((state: RootState) => state.chat.password);

  const [bridgeAddress, setBridgeAddress] = useState<string>(stateBridgeAddress);
  const [serverAddress, setServerAddress] = useState<string>(stateServerAddress || "");
  const [credentials, setCredentials] = useState<{
    username: string,
    password: string
  }>({
    username: stateUsername,
    password: statePassword || ""
  });

  const saveConnectionDetails = () => {
    if (bridgeAddress.trim() === "" || serverAddress.trim() === "" || credentials.username.trim() === "") {
      showNotification({
        title: "Invalid Connection Parameters",
        message: "One of the required connection parameters is empty or not valid.",
        color: "red",
        icon: <X />
      });
      return;
    }

    dispatch(chatActions.setConnectionParameters({
      bridgeAddress,
      serverAddress,
      ...credentials
    }));
    showNotification({
      title: "Connecton Parameters Saved",
      message: `Connecting to ${serverAddress} via ${bridgeAddress} as ${credentials.username}.`,
      color: "green",
      icon: <Check />
    })
  }

  return (
    <>
      <Text size="md" mb="sm">Connection Settings</Text>
      <TextInput label="Bridge URL" required value={bridgeAddress} onChange={(event) => setBridgeAddress(event.target.value)} />
      <TextInput label="Server" required value={serverAddress} onChange={(event) => setServerAddress(event.target.value)} />
      <TextInput label="Username" required value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} />
      <TextInput label="Password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} />
      <Button mt="sm" sx={{ float: "right" }} onClick={saveConnectionDetails}>Save</Button>
    </>
  );
}

export default ConnectModal;
