import axios from "axios";

const headers={
    Authorization:`Bearer ${process.env.HF_API_KEY}`
}

const generateSummary=async(text)=>{
   const res=await axios.post(
   "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
    {inputs:text},
    {headers}
   )

   return res.data[0].summary_text;
}

const generateTags = async (text) => {
  const res = await axios.post(
     "https://router.huggingface.co/hf-inference/models/ml6team/keyphrase-extraction-kbir-inspec",
    {inputs: text},
    { headers }
  );

  console.log("Keyphrase API Response:", res.data);
  
  return res.data.map(item => item.word.trim());
};

export {generateSummary,generateTags};