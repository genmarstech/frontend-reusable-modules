// The four-step process, shown on the home page and on Quality.
export default function Steps() {
  return (
    <ol className="steps">
      <li><h3>Source</h3><p>We buy direct from growers and cooperatives we have worked with for years across Kenya and Tanzania.</p><span className="meta">Traceable to region</span></li>
      <li><h3>Grade &amp; sort</h3><p>Lots are cleaned, sorted and graded to the specification agreed in your contract.</p><span className="meta">Sample on request</span></li>
      <li><h3>Pack</h3><p>Jute, PP or vacuum packing, bales for sisal, and private labelling to suit your market.</p><span className="meta">Custom packing</span></li>
      <li><h3>Document &amp; ship</h3><p>We prepare the export paperwork and book the container out of Mombasa or Dar es Salaam.</p><span className="meta">FOB · CFR · CIF</span></li>
    </ol>
  );
}
