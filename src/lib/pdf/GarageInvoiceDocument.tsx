import { readFileSync } from "node:fs";
import path from "node:path";
import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  type InvoiceDocumentData,
  formatCurrency,
} from "@/lib/invoice";

const GARAGE_LOGO_SRC = `data:image/svg+xml;base64,${readFileSync(
  path.join(process.cwd(), "public", "garage-logo.svg"),
).toString("base64")}`;
const SURFACE_RADIUS = 6;

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#111111",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    paddingTop: 36,
    paddingRight: 36,
    paddingBottom: 36,
    paddingLeft: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerLeft: {
    width: "48%",
  },
  headerRight: {
    width: "34%",
    alignItems: "flex-end",
  },
  logo: {
    height: 28,
    marginBottom: 12,
    width: 106,
  },
  companyName: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  },
  companyText: {
    color: "#525252",
    fontSize: 9,
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 0.6,
    marginBottom: 16,
  },
  sectionLabel: {
    color: "#737373",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  detailPanel: {
    width: "100%",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailRowLast: {
    marginBottom: 0,
  },
  detailLabel: {
    color: "#737373",
    marginRight: 14,
  },
  detailValue: {
    fontWeight: 700,
    maxWidth: 140,
    textAlign: "right",
  },
  billToSection: {
    marginBottom: 18,
    width: "48%",
  },
  blankField: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  blankLabel: {
    color: "#525252",
    fontSize: 10,
    marginRight: 10,
    width: 56,
  },
  blankLine: {
    borderBottomColor: "#d4d4d4",
    borderBottomWidth: 1,
    flex: 1,
    height: 12,
  },
  table: {
    backgroundColor: "#e5e5e5",
    borderRadius: SURFACE_RADIUS,
    marginBottom: 14,
    overflow: "hidden",
    padding: 1,
  },
  tableHeader: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: SURFACE_RADIUS - 1,
    borderTopRightRadius: SURFACE_RADIUS - 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tableRow: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: SURFACE_RADIUS - 1,
    borderBottomRightRadius: SURFACE_RADIUS - 1,
    borderTopColor: "#e5e5e5",
    borderTopWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableCellDescription: {
    paddingRight: 10,
    width: "54%",
  },
  tableCellQty: {
    textAlign: "right",
    width: "8%",
  },
  tableCellUnitPrice: {
    textAlign: "right",
    width: "19%",
  },
  tableCellAmount: {
    textAlign: "right",
    width: "19%",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  rowTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 5,
  },
  rowDetailLine: {
    color: "#525252",
    fontSize: 9,
    lineHeight: 1.35,
    marginBottom: 2,
  },
  rowDescription: {
    color: "#404040",
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 6,
    marginTop: 6,
  },
  listingLink: {
    color: "#f97315",
    fontSize: 9,
    fontWeight: 700,
    textDecoration: "none",
  },
  totalsCard: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e5e5e5",
    borderRadius: SURFACE_RADIUS,
    borderWidth: 1,
    padding: 12,
    marginLeft: "auto",
    width: "34%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  totalRowLast: {
    marginBottom: 0,
  },
  totalLabel: {
    color: "#525252",
  },
  totalValue: {
    fontWeight: 700,
  },
  totalRule: {
    backgroundColor: "#d4d4d4",
    height: 1,
    marginVertical: 8,
  },
  totalDueCard: {
    paddingTop: 2,
  },
  totalDueLabel: {
    color: "#111111",
    fontSize: 10,
    fontWeight: 700,
  },
  totalDueValue: {
    color: "#111111",
    fontSize: 16,
    fontWeight: 700,
  },
});

type InvoiceDocumentProps = {
  invoice: InvoiceDocumentData;
};

function InvoiceDetailsBlock({
  items,
}: {
  items: InvoiceDocumentData["invoiceDetails"];
}) {
  return (
    <View style={styles.detailPanel}>
      {items.map((item, index) => (
        <View
          key={item.label}
          style={
            index === items.length - 1
              ? [styles.detailRow, styles.detailRowLast]
              : styles.detailRow
          }
        >
          <Text style={styles.detailLabel}>{item.label}</Text>
          <Text style={styles.detailValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

function BillToBlock({
  fields,
}: {
  fields: InvoiceDocumentData["billToFields"];
}) {
  return (
    <View style={styles.billToSection}>
      <Text style={styles.sectionLabel}>Bill To</Text>
      {fields.map((field) => (
        <View key={field} style={styles.blankField}>
          <Text style={styles.blankLabel}>{field}</Text>
          <View style={styles.blankLine} />
        </View>
      ))}
    </View>
  );
}

export function GarageInvoiceDocument({ invoice }: InvoiceDocumentProps) {
  const totalAmount = invoice.amount + invoice.taxAmount;

  return (
    <Document
      author={invoice.companyName}
      creator={invoice.companyName}
      producer={invoice.companyName}
      title={`${invoice.invoiceNumber} - ${invoice.title}`}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* react-pdf Image is not a DOM img element and does not accept alt. */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={GARAGE_LOGO_SRC} style={styles.logo} />
            <Text style={styles.companyName}>{invoice.companyName}</Text>
            {invoice.companyAddressLines.map((line) => (
              <Text key={line} style={styles.companyText}>
                {line}
              </Text>
            ))}
            <Text style={styles.companyText}>{invoice.companyPhone}</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <InvoiceDetailsBlock items={invoice.invoiceDetails} />
          </View>
        </View>

        <BillToBlock fields={invoice.billToFields} />

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableCellDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableCellQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.tableCellUnitPrice]}>
              Unit Price
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableCellAmount]}>
              Amount
            </Text>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCellDescription}>
              <Text style={styles.rowTitle}>{invoice.title}</Text>
              {invoice.itemDetailLines.map((line) => (
                <Text key={line} style={styles.rowDetailLine}>
                  {line}
                </Text>
              ))}
              {invoice.itemDescription ? (
                <Text style={styles.rowDescription}>{invoice.itemDescription}</Text>
              ) : null}
              <Link src={invoice.listingUrl} style={styles.listingLink}>
                {"View Listing"}
              </Link>
            </View>
            <Text style={styles.tableCellQty}>{invoice.quantity}</Text>
            <Text style={styles.tableCellUnitPrice}>
              {formatCurrency(invoice.unitPrice)}
            </Text>
            <Text style={styles.tableCellAmount}>
              {formatCurrency(invoice.amount)}
            </Text>
          </View>
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.taxAmount)}
            </Text>
          </View>
          <View style={styles.totalRule} />
          <View style={styles.totalDueCard}>
            <View style={[styles.totalRow, styles.totalRowLast]}>
              <Text style={styles.totalDueLabel}>Total Due</Text>
              <Text style={styles.totalDueValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function createGarageInvoiceDocument(invoice: InvoiceDocumentData) {
  return <GarageInvoiceDocument invoice={invoice} />;
}
