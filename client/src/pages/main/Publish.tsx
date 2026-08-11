import React from "react";
import { useParams } from "react-router-dom";

export default function Publish() {
  const { id } = useParams();
  return <div>This is publish website {id}</div>;
}
