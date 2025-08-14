export type ShopifyProduct = {
  Handle: string;
  Title: string;
  Body: string;
  Vendor?: string;
  Type?: string;
  Tags?: string;
  Published?: boolean;
  "SEO Title"?: string;
  "SEO Description"?: string;
};

export function toShopifyCSV(products: ShopifyProduct[]): string {
  const headers = [
    'Handle','Title','Body','Vendor','Type','Tags','Published','SEO Title','SEO Description'
  ];
  const escape = (s: any) => {
    const v = s === undefined || s === null ? '' : String(s);
    if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
    return v;
  };
  const rows = products.map(p => headers.map(h => escape((p as any)[h])));
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function toShopifyJSON(products: ShopifyProduct[]) {
  return JSON.stringify(products, null, 2);
}
